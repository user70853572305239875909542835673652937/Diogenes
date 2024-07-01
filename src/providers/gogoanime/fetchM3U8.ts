import puppeteer from 'puppeteer-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import { chrome } from 'chrome-paths';

puppeteer.use(stealth());

export interface FetchM3U8Result {
    m3u8: string | null;
}

export const fetchM3U8 = async (iframeUrl: string): Promise<FetchM3U8Result> => {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: chrome,
        defaultViewport: null,
        args: [
            '--autoplay-policy=no-user-gesture-required',
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
        if (resourceType === 'image' || resourceType === 'stylesheet' || resourceType === 'font') {
            req.abort();
        } else {
            req.continue();
        }
    });

    const client = await page.target().createCDPSession();

    try {
        await client.send('Network.enable');
        await client.send('Network.setRequestInterception', {
            patterns: [{ urlPattern: '*' }]
        });

        let m3u8: string | null = null;
        let foundPrimaryM3U8 = false;

        client.on('Network.requestIntercepted', async ({ interceptionId, request }: { interceptionId: string, request: any }) => {
            if (foundPrimaryM3U8) {
                await client.send('Network.continueInterceptedRequest', { interceptionId });
                return;
            }

            if (request.url.includes('.m3u8') && !request.url.includes('ping.gif')) {
                m3u8 = request.url;
                if (m3u8) {
                    foundPrimaryM3U8 = true;
                }
            }
            await client.send('Network.continueInterceptedRequest', { interceptionId });
        });

        await page.goto(iframeUrl, { waitUntil: 'networkidle2' });

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

        return { m3u8 };
    } catch (error) {
        console.error('Error fetching M3U8:', error);
        return { m3u8: null };
    } finally {
        await browser.close();
    }
};
