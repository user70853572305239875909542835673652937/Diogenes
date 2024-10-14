import axios from 'axios';
import * as cheerio from 'cheerio';
import { cache } from '../../index';

/**
 * Interface for Episode Information
 */
interface Episode {
    number: number;
    duration: string;
    snapshot: string;
    watchLink: string;
    isNew: boolean;
}

/**
 * Interface for Anime Information
 */
interface PaheInfo {
    id: string;
    title: string;
    japanese: string;
    image: string;
    type: string;
    description: string;
    genre: string;
    released: string;
    status: string;
    otherNames: string;
    season: string;
    studio: string;
    externalLinks: string[];
    episodes: number;
    episodeList: Episode[];
}

/**
 * Interface for API Episode Data
 */
interface PaheEpisode {
    id: number;
    anime_id: number;
    episode: number;
    episode2: number;
    edition: string;
    title: string;
    snapshot: string;
    disc: string;
    audio: string;
    duration: string;
    session: string;
    filler: number;
    created_at: string;
}

/**
 * Interface for API Response
 */
interface PaheApi {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    from: number;
    to: number;
    data: PaheEpisode[];
}

/**
 * Fetch Anime Information from AnimePahe
 * @param id - The numeric ID of the anime (e.g., "5687")
 * @returns PaheInfo object or null if not found/error
 */
export const fetchInfoAnimepahe = async (id: string): Promise<PaheInfo | null> => {
    const cacheKey = `animepahe:${id}`;

    if (cache.has(cacheKey)) {
        console.log(`Fetching anime info for id ${id} from cache`);
        return cache.get(cacheKey);
    }

    const url = `https://animepahe.ru/a/${id}`;

    try {
        // Fetch the main page
        const response = await axios.get(url, {
            headers: {
                // Essential headers to mimic a real browser and bypass DDoS protection
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                    'Chrome/58.0.3029.110 Safari/537.3',
                'Accept-Language': 'en-US,en;q=0.9',
                Accept:
                    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                Connection: 'keep-alive',
                Referer: 'https://animepahe.ru/', // Essential referer header
                Host: 'animepahe.ru',             // Host header
                Cookie: '__ddg1_=; __ddg2_=',     // DDoS protection cookies
            },
        });

        const $ = cheerio.load(response.data);

        // Debug: Check if the main anime detail section exists
        if ($('article.page-detail').length === 0) {
            console.error('Main anime detail section not found.');
            return null;
        }

        // Extract Basic Anime Information
        const animeInfo: PaheInfo = {
            id,
            title: $('h1 > span').first().text().trim(), // Corrected selector
            japanese: $('p:contains("Japanese:")').text().replace('Japanese:', '').trim(),
            image:
                $('div.anime-poster img').attr('data-src') ||
                $('div.anime-poster img').attr('src') ||
                '',
            type: $('p:contains("Type:") a').text().trim(),
            description: $('div.anime-synopsis').text().trim(),
            genre: $('div.anime-genre a')
                .map((i: number, el: any) => $(el).text().trim())
                .get()
                .join(', '),
            released: $('p:contains("Aired:")').text().replace('Aired:', '').trim(),
            status: $('p:contains("Status:") a').text().trim(),
            otherNames: $('p:contains("Synonyms:")').text().replace('Synonyms:', '').trim(),
            season: $('p:contains("Season:") a').text().trim(),
            studio: $('p:contains("Studio:")').text().replace('Studio:', '').trim(),
            externalLinks: $('p.external-links a')
                .map((i: number, el: any) => $(el).attr('href'))
                .get()
                .map((link) => `https:${link}`),
            episodes:
                parseInt(
                    $('p:contains("Episodes:")').text().replace('Episodes:', '').trim(),
                    10
                ) || 0,
            episodeList: [], // Will be populated below
        };

        // Debug: Log extracted basic information
        console.log('Basic Anime Info:', animeInfo);

        // Extract the Release ID for API Call
        let releaseId: string | null = null;
        $('script').each((i, elem) => {
            const scriptContent = $(elem).html();
            if (scriptContent) {
                const match = scriptContent.match(/let\s+id\s*=\s*"([^"]+)"/);
                if (match && match[1]) {
                    releaseId = match[1];
                }
            }
        });

        // Debug: Log the extracted release ID
        console.log(`Extracted Release ID: ${releaseId}`);

        if (!releaseId || releaseId === id) {
            // Ensure releaseId is valid and not the numeric id
            console.error('Release ID not found or invalid. Cannot fetch episodes.');
            return animeInfo; // Return anime info without episodes
        }

        // Construct the API URL for fetching episodes
        const apiUrl = `https://animepahe.ru/api?m=release&id=${releaseId}&sort=episode_desc&page=1`;

        // Headers to be used in API requests
        const apiHeaders = {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                'Chrome/58.0.3029.110 Safari/537.3',
            Accept: 'application/json',
            Referer: 'https://animepahe.ru/', // Essential referer header
            Host: 'animepahe.ru',             // Host header
            Cookie: '__ddg1_=; __ddg2_=',     // DDoS protection cookies
        };

        // Fetch Episodes from the API
        const apiResponse = await axios.get<PaheApi>(apiUrl, {
            headers: apiHeaders,
        });

        // Parse the JSON response
        const episodesData = apiResponse.data;

        // Debug: Log the entire API response
        console.log('API Response:', episodesData);

        if (episodesData && episodesData.data && Array.isArray(episodesData.data)) {
            console.log(
                `Found ${episodesData.data.length} episodes on page ${episodesData.current_page}.`
            );

            episodesData.data.forEach((ep: PaheEpisode) => {
                const episodeNumber = ep.episode || ep.episode2 || 1;
                const duration = ep.duration || '';
                const snapshot = ep.snapshot || '';
                const watchLinkRelative = `/play/${releaseId}/${ep.session}`; // Corrected watch link structure
                const watchLink = `https://animepahe.ru${watchLinkRelative}`;
                const isNew = (() => {
                    const episodeDate = new Date(ep.created_at);
                    const currentDate = new Date();
                    const diffTime = Math.abs(currentDate.getTime() - episodeDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays <= 7; // Episodes released within the last 7 days are considered new
                })();

                // Debug: Log each episode's extracted data
                console.log(`Episode ${episodeNumber}:`, {
                    duration,
                    snapshot,
                    watchLink,
                    isNew,
                });

                // Push Episode Data to the List
                animeInfo.episodeList.push({
                    number: parseInt(episodeNumber.toString(), 10),
                    duration,
                    snapshot,
                    watchLink,
                    isNew,
                });
            });

            // Handle Pagination (if applicable)
            const totalPages = episodesData.last_page;
            for (let page = 2; page <= totalPages; page++) {
                const paginatedApiUrl = `https://animepahe.ru/api?m=release&id=${releaseId}&sort=episode_desc&page=${page}`;
                try {
                    const paginatedResponse = await axios.get<PaheApi>(paginatedApiUrl, {
                        headers: apiHeaders,
                    });
                    const paginatedData = paginatedResponse.data;

                    // Debug: Log the paginated API response
                    console.log(`API Response for page ${page}:`, paginatedData);

                    if (paginatedData && paginatedData.data && Array.isArray(paginatedData.data)) {
                        console.log(`Page ${page}: Found ${paginatedData.data.length} episodes.`);

                        paginatedData.data.forEach((ep: PaheEpisode) => {
                            const episodeNumber = ep.episode || ep.episode2 || 1;
                            const duration = ep.duration || '';
                            const snapshot = ep.snapshot || '';
                            const watchLinkRelative = `/play/${releaseId}/${ep.session}`; // Corrected watch link structure
                            const watchLink = `https://animepahe.ru${watchLinkRelative}`;
                            const isNew = (() => {
                                const episodeDate = new Date(ep.created_at);
                                const currentDate = new Date();
                                const diffTime = Math.abs(
                                    currentDate.getTime() - episodeDate.getTime()
                                );
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                return diffDays <= 7; // Episodes released within the last 7 days are considered new
                            })();

                            // Debug: Log each episode's extracted data
                            console.log(`Episode ${episodeNumber}:`, {
                                duration,
                                snapshot,
                                watchLink,
                                isNew,
                            });

                            // Push Episode Data to the List
                            animeInfo.episodeList.push({
                                number: parseInt(episodeNumber.toString(), 10),
                                duration,
                                snapshot,
                                watchLink,
                                isNew,
                            });
                        });
                    } else {
                        console.warn(`No episode data found on page ${page}.`);
                    }
                } catch (paginatedError) {
                    console.error(`Error fetching episodes on page ${page}:`, paginatedError);
                }
            }

            // Optional: Sort the episodeList by episode number ascending
            animeInfo.episodeList.sort((a, b) => a.number - b.number);
        } else {
            console.warn('No episode data found in API response.');
        }

        // Debug: Log the complete episode list
        console.log('Complete Episode List:', animeInfo.episodeList);

        // Cache the Result
        cache.set(cacheKey, animeInfo);

        return animeInfo;
    } catch (error) {
        console.error('Error fetching anime info from AnimePahe:', error);
        return null;
    }
};
