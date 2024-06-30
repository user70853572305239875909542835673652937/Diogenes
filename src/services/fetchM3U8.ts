import puppeteer from 'puppeteer-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import { chrome } from 'chrome-paths';
import fetchResolutions from './fetchResolutions';

puppeteer.use(stealth());

export interface FetchM3U8Result {
    m3u8: string | null;
    resolutions: string[] | null;
    downloadUrl: string | null;
}

const fetchM3U8 = async (iframeUrl: string): Promise<FetchM3U8Result> => {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: chrome,
        defaultViewport: null,
        args: ['--autoplay-policy=no-user-gesture-required']
    });

    const page = await browser.newPage();
    const client = await page.target().createCDPSession();

    await client.send('Network.enable');
    await client.send('Network.setRequestInterception', {
        patterns: [{ urlPattern: '*' }]
    });

    let m3u8: string | null = null;
    let resolutions: string[] | null = null;
    let downloadUrl: string | null = null;
    let foundPrimaryM3U8 = false;

    client.on('Network.requestIntercepted', async ({ interceptionId, request }: { interceptionId: string, request: any }) => {
        if (foundPrimaryM3U8) {
            await client.send('Network.continueInterceptedRequest', { interceptionId });
            return;
        }

        if (request.url.includes('.m3u8') && !request.url.includes('ping.gif')) {
            console.log(`M3U8 URL: ${request.url}`);
            m3u8 = request.url;
            if (m3u8) {
                resolutions = await fetchResolutions(m3u8);
                foundPrimaryM3U8 = true;
            }
        }
        await client.send('Network.continueInterceptedRequest', { interceptionId });
    });

    await page.goto(iframeUrl, { waitUntil: 'networkidle2' });

    await page.evaluate(() => {
        const playBtnXPath = "/html/body/div[1]/div/div[3]/div[2]/div[13]/div[1]/div/div/div[2]/div";
        const playBtn = document.evaluate(playBtnXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (playBtn) {
            (playBtn as HTMLElement).click();
        }
    });

    await page.waitForFunction(() => {
        const videoElement = document.querySelector('video');
        return videoElement && !videoElement.paused;
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    downloadUrl = await page.evaluate(() => {
        const iframe = document.querySelector('iframe');
        if (iframe) {
            const embed = iframe.src;
            const idMatch = embed.match(/id=([^&]+)/);
            return idMatch ? `https://s3taku.com/download?id=${idMatch[1]}` : null;
        }
        return null;
    });

    await browser.close();
    return { m3u8, resolutions, downloadUrl };
};

export default fetchM3U8;
