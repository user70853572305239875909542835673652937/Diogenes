import axios from 'axios';
import * as cheerio from 'cheerio';
import { type FetchM3U8Result, fetchM3U8 } from '../../index';
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

export const fetchSourcesGogo = async (provider: string, animeId: string, episodeNumber: number): Promise<SourcesResponse> => {
    const sources: { [key: string]: Source } = {};
    let downloadUrl: string | null = null;
    const episodeId = `${animeId}-episode-${episodeNumber}`;

    const retrieveSource = async (episodeNumber: number) => {
        const cacheKey = episodeId;
        if (cache.has(cacheKey)) {
            console.log(`Fetching episode ${episodeNumber} from cache`);
            const cachedData = cache.get(cacheKey)!;
            Object.assign(sources, cachedData.sources);
            downloadUrl = cachedData.downloadUrl;
            return;
        }

        const episodeUrl = `https://anitaku.pe/${animeId}-episode-${episodeNumber}`;
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
                    let m3u8: string | null = null;

                    if (serverName === 'Vidstreaming') {
                        const fetchResult: FetchM3U8Result = await fetchM3U8(embed);
                        m3u8 = fetchResult.m3u8;
                        downloadUrl = await fetchDownloadUrl(embed);
                    } else if (serverName !== 'Doodstream') {
                        const fetchResult: FetchM3U8Result = await fetchM3U8(embed);
                        m3u8 = fetchResult.m3u8;
                    }

                    const source: Source = {
                        embed,
                        m3u8,
                    };
                    sources[serverName] = source;
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