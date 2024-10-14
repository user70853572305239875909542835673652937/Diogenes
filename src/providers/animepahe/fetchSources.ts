import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';

/**
 * Interface for Download Link Information
 */
interface DownloadLink {
    fansub: string;
    resolution: string;
    size: string;
    url: string;
}

/**
 * Interface for Play Page Information
 */
interface PlayPageInfo {
    animeId: string;
    episodeId: string;
    title: string;
    videoSession: string;
    videoProvider: string;
    videoUrl: string;
    nextEpisodeLink: string | null;
    downloadLinks: DownloadLink[];
}

/**
 * Fetches the m3u8 video URL by evaluating the JavaScript code embedded in the page.
 * @param url - The URL of the page containing the m3u8 link.
 * @returns The extracted m3u8 video URL.
 */
const fetchM3U8Url = async (url: string): Promise<string> => {
    const referer = 'https://animepahe.ru/';

    const pageContent = await fetch(url, {
        headers: { Referer: referer },
    }).then((response) => response.text());

    const scriptContentMatch = /(eval)(\(function[\s\S]*?)(<\/script>)/s.exec(pageContent);
    const scriptContent = scriptContentMatch?.[2].replace('eval', '') || '';

    const evaluatedScript = eval(scriptContent);
    const m3u8LinkMatch = evaluatedScript.match(/https.*?m3u8/);
    const m3u8Link = m3u8LinkMatch?.[0];

    if (!m3u8Link) {
        throw new Error('Failed to extract m3u8 link.');
    }

    return m3u8Link;
};

/**
 * Fetches the m3u8 video URL from the kiwi server.
 * @param url - The URL of the page hosted on the kiwi server.
 * @returns The extracted m3u8 video URL.
 */
const fetchKiwiM3U8Url = async (url: string): Promise<string> => {
    const pageContent = await fetch(url, {
        headers: { Cookie: '__ddg1=;__ddg2_=' }, // DDoS protection cookies
    }).then((response) => response.text());

    const urlMatch = pageContent.match(/let url = "(.*)"/);
    if (!urlMatch) {
        throw new Error('Failed to extract video URL.');
    }

    const videoPageUrl = urlMatch[1];
    const m3u8Url = await fetchM3U8Url(videoPageUrl);

    return m3u8Url;
};

/**
 * Fetches and extracts information from the AnimePahe play page.
 * @param provider - The provider name (e.g., 'animepahe').
 * @param animeId - The AnimePahe anime ID.
 * @param episodeId - The AnimePahe episode ID.
 * @returns An object containing the extracted play page information.
 */
export const fetchSourcesPahe = async (
    provider: string,
    animeId: string,
    episodeId: string
): Promise<PlayPageInfo | null> => {
    const playPageUrl = `https://animepahe.ru/play/${animeId}/${episodeId}`;

    try {
        // Fetch the m3u8 video URL
        const videoUrl = await fetchKiwiM3U8Url(playPageUrl);

        // Initialize the PlayPageInfo object
        const playPageInfo: PlayPageInfo = {
            animeId,
            episodeId,
            title: '',
            videoSession: '',
            videoProvider: '',
            videoUrl,
            nextEpisodeLink: null,
            downloadLinks: [],
        };

        // Axios configuration with necessary headers
        const axiosConfig: AxiosRequestConfig = {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                    'Chrome/58.0.3029.110 Safari/537.3',
                'Accept-Language': 'en-US,en;q=0.9',
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                Connection: 'keep-alive',
                Referer: 'https://animepahe.ru/', // Essential referer header
                Host: 'animepahe.ru',             // Host header
                Cookie: '__ddg1_=; __ddg2_=',     // DDoS protection cookies
            },
            timeout: 15000,
            maxRedirects: 5,
        };

        // Fetch the play page content using axios
        const response = await axios.get(playPageUrl, axiosConfig);
        const $ = cheerio.load(response.data);

        // Extract the page title and clean it
        const pageTitle = $('title').text();
        playPageInfo.title = pageTitle.replace(':: animepahe', '').trim();

        // Extract JavaScript variables: session and provider
        $('script').each((_, scriptElement) => {
            const scriptContent = $(scriptElement).html();
            if (scriptContent) {
                const sessionMatch = scriptContent.match(/let\s+session\s*=\s*"([^"]+)"/);
                const providerMatch = scriptContent.match(/let\s+provider\s*=\s*"([^"]+)"/);

                if (sessionMatch) {
                    playPageInfo.videoSession = sessionMatch[1];
                }

                if (providerMatch) {
                    playPageInfo.videoProvider = providerMatch[1];
                }
            }
        });

        // Extract the next episode link, if available
        const sequelHref = $('div.sequel a').attr('href');
        if (sequelHref) {
            playPageInfo.nextEpisodeLink = `https://animepahe.ru${sequelHref}`;
        }

        // Extract download links from the dropdown menu
        $('div#pickDownload a.dropdown-item').each((_, linkElement) => {
            const href = $(linkElement).attr('href') || '';
            const text = $(linkElement).text().trim();

            // Regex to parse fansub, resolution, and size
            const textMatch = text.match(/^(.+?)\s*·\s*(\d+p)\s*\(([\d.]+MB)\)$/);

            if (textMatch) {
                const [_, fansub, resolution, size] = textMatch;

                playPageInfo.downloadLinks.push({
                    fansub,
                    resolution,
                    size,
                    url: href,
                });
            }
        });

        // Validate essential fields
        if (!playPageInfo.videoSession || !playPageInfo.videoProvider || !playPageInfo.videoUrl) {
            console.error('Failed to extract essential video information.');
            return null;
        }

        return playPageInfo;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error scraping AnimePahe play page:');

            if (error.response) {
                console.error(`Status: ${error.response.status}`);
                console.error(`Headers: ${JSON.stringify(error.response.headers)}`);
                console.error(`Data: ${error.response.data}`);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error setting up request:', error.message);
            }
        } else {
            console.error('Unexpected error:', error);
        }
        return null;
    }
};

// Usage example (for testing purposes)
// (async () => {
//     const playPageData = await fetchSourcesPahe(
//         'animepahe',
//         '246daabb-53cb-b0b4-92ce-602d65d22c2f',
//         'dbf49a7becc5bfd8c15f0dee4d743c593e36171500b0531de5ccf71734a082ec'
//     );
//     if (playPageData) {
//         console.log('Play Page Information:', playPageData);
//     }
// })();
