import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import { cache } from '../../utils/cacheSetup';

puppeteer.use(stealth());

interface Source {
    embed: string;
    m3u8: string | null;
}

interface SourcesResponse {
    provider: string;
    episodeId: string;
    downloadUrl: string | null;
    sources: { [key: string]: Source };
}

const fetchDownloadUrl = async (embedUrl: string): Promise<string | null> => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(embedUrl, { waitUntil: 'networkidle2' });

    const downloadUrl = await page.evaluate(() => {
        const iframe = document.querySelector('iframe');
        if (iframe) {
            const embed = iframe.src;
            const idMatch = embed.match(/id=([^&]+)/);
            return idMatch ? `https://s3taku.com/download?id=${idMatch[1]}` : null;
        }
        return null;
    });

    await browser.close();
    return downloadUrl;
};

const fetchM3U8Directly = async (embedUrl: string): Promise<string | null> => {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-breakpad',
            '--disable-component-extensions-with-background-pages',
            '--disable-features=TranslateUI,BlinkGenPropertyTrees',
            '--disable-ipc-flooding-protection',
            '--disable-renderer-backgrounding',
            '--enable-features=NetworkService,NetworkServiceInProcess',
            '--hide-scrollbars',
            '--mute-audio',
            '--no-first-run',
            '--no-pings',
            '--disable-popup-blocking'
        ]
    });

    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['image', 'stylesheet', 'font'].includes(resourceType)) {
            req.abort();
        } else {
            req.continue();
        }
    });

    const client = await page.target().createCDPSession();

    let m3u8: string | null = null;
    let foundPrimaryM3U8 = false;

    try {
        await client.send('Network.enable');
        await client.send('Network.setRequestInterception', {
            patterns: [{ urlPattern: '*' }]
        });

        client.on('Network.requestIntercepted', async ({ interceptionId, request }) => {
            if (foundPrimaryM3U8) {
                await client.send('Network.continueInterceptedRequest', { interceptionId });
                return;
            }

            if (request.url.includes('.m3u8') && !request.url.includes('ping.gif')) {
                m3u8 = request.url;
                foundPrimaryM3U8 = true;
            }
            await client.send('Network.continueInterceptedRequest', { interceptionId });
        });

        await page.goto(embedUrl, { waitUntil: 'networkidle2' });

        // If the video has a play button, click it to start playback and trigger m3u8 requests
        await page.evaluate(() => {
            const playBtn = document.querySelector('.jw-icon-display');
            if (playBtn) {
                (playBtn as HTMLElement).click();
            }
        });

        await page.waitForFunction(() => {
            const videoElement = document.querySelector('video');
            return videoElement && !videoElement.paused;
        });

    } catch (error) {
        console.error('Error fetching M3U8:', error);
    } finally {
        await browser.close();
    }

    return m3u8;
};

export const fetchSourcesGogo = async (provider: string, animeId: string, episodeNumber: string | number): Promise<SourcesResponse> => {
    const sources: { [key: string]: Source } = {};
    let downloadUrl: string | null = null;
    const episodeId = `${animeId}-episode-${episodeNumber}`;

    const retrieveSource = async (episodeNumber: string | number) => {
        const cacheKey = episodeId;
        if (cache.has(cacheKey)) {
            console.log(`Fetching episode ${episodeNumber} from cache`);
            const cachedData = cache.get(cacheKey)!;
            Object.assign(sources, cachedData.sources);
            downloadUrl = cachedData.downloadUrl;
            return;
        }

        const episodeUrl = `https://s3taku.com/videos/${animeId}-episode-${episodeNumber}`;
        try {
            const response = await axios.get(episodeUrl);
            const $ = cheerio.load(response.data);
            const serverLinks = $('.anime_muti_link ul li a');

            if (serverLinks.length === 0) {
                console.error(`No server links found for episode ${episodeNumber}`);
                return;
            }

            for (let i = 0; i < serverLinks.length; i++) {
                const link = $(serverLinks[i]);
                const embed = link.attr('data-video');
                const serverName = link.contents().not(link.find('span')).text().trim();

                if (embed) {
                    // Directly use the logic from fetchM3U8 to get the m3u8 link
                    const m3u8 = await fetchM3U8Directly(embed);

                    // If we successfully get an m3u8, store the source and stop the loop
                    if (m3u8) {
                        sources[serverName] = { embed, m3u8 };

                        if (serverName === 'Vidstreaming') {
                            downloadUrl = await fetchDownloadUrl(embed);
                        }
                        break; // Stop after the first successful m3u8
                    }
                }
            }

            if (Object.keys(sources).length > 0) {
                cache.set(cacheKey, { sources, downloadUrl });
            }
        } catch (error) {
            console.error(`Error fetching episode ${episodeNumber}:`, error);
        }
    };

    await retrieveSource(episodeNumber);

    return { provider: provider, episodeId: episodeId, downloadUrl, sources };
};
