import axios from 'axios';
import { load } from 'cheerio';
import { Element } from 'domhandler';

// Simple in-memory cache using Map
const cache = new Map<string, AnimeMeta>();

// Define the AnimeMeta interface
interface AnimeMeta {
    anime_id?: string;
    mal_id?: string;
    anilist_id?: string;
    series_url?: string;
    title: string;
    jptitle?: string;
    synonyms: string[];
    description: string;
    poster?: string;
    aired: {
        premiered?: string;
        date_aired?: string;
        broadcast?: string;
        status?: string;
        [key: string]: string | undefined;
    };
    genres: string[];
    producers: string[];
    studios: string[];
    duration: string;
    episodes: {
        sub: number;
        dub: number;
        total: number;
    };
    malScore?: string;
    rating?: string;
    quality?: string;
    type?: string;
    characters: {
        name: string;
        role: string;
        voice_actor: {
            name: string;
            language: string;
        } | null;
    }[];
    related_anime: {
        title: string;
        url: string;
        type: string;
    }[];
    promotional_videos: {
        title: string;
        url: string;
        thumbnail: string;
    }[];
    seasons: {
        title: string;
        url: string;
        thumbnail: string;
    }[];
}

// Utility function to parse episode count
const parseEpisodeCount = (text: string): number => {
    const cleanedText = text.match(/\d+/);
    if (cleanedText) {
        return parseInt(cleanedText[0], 10);
    }
    return 0;
};

// Main function to fetch anime info
export const fetchInfoZoro = async (id: string): Promise<AnimeMeta | null> => {
    const cacheKey = `zoro:${id}`;

    // Check if data is in cache
    if (cache.has(cacheKey)) {
        console.log(`Fetching anime info for id ${id} from cache`);
        return cache.get(cacheKey) as AnimeMeta;
    }

    const url = `https://hianime.to/${id}`;

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                    'Chrome/58.0.3029.110 Safari/537.3'
            },
            timeout: 10000 // 10 seconds timeout
        });

        const $ = load(response.data);

        // Extract the syncData JSON from the script
        const syncDataScript = $('script#syncData').html();
        let syncData: {
            anime_id?: string;
            mal_id?: string;
            anilist_id?: string;
            series_url?: string;
        } = {};

        if (syncDataScript) {
            try {
                const parsedSyncData = JSON.parse(syncDataScript);
                syncData = {
                    anime_id: parsedSyncData.anime_id,
                    mal_id: parsedSyncData.mal_id,
                    anilist_id: parsedSyncData.anilist_id,
                    series_url: parsedSyncData.series_url
                };
            } catch (jsonError) {
                console.error(`Error parsing syncData JSON for id ${id}:`, jsonError);
            }
        } else {
            console.warn(`No syncData script found for id ${id}`);
        }

        const $filmStats = $('.film-stats > .tick');

        // Extract and structure the anime information
        const animeInfo: AnimeMeta = {
            anime_id: syncData.anime_id,
            mal_id: syncData.mal_id,
            anilist_id: syncData.anilist_id,
            series_url: syncData.series_url,
            title: $('.dynamic-name').first().text().trim(),
            jptitle: $('.item-title:contains("Japanese") .name').text().trim() || undefined,
            synonyms: [
                $('.dynamic-name').first().text().trim(),
                $('.item-title:contains("Synonyms") .name').text().trim()
            ].filter(Boolean),
            description: $('.item.item-title:contains("Overview") .text').text().trim(),
            poster: $(".film-poster-img").attr("src") || undefined,
            aired: {
                date_aired: $('.item-title:contains("Aired") .name').text().trim() || undefined,
                premiered: $('.item-title:contains("Premiered") .name').text().trim() || undefined,
                status: $('.item-title:contains("Status") .name').text().trim() || undefined
            },
            genres: $('.item-list a')
                .map((i: number, el: Element) => $(el).text().trim())
                .get(),
            producers: $('.item-title:contains("Producers") a')
                .map((i: number, el: Element) => $(el).text().trim())
                .get(),
            studios: $('.item-title:contains("Studios") a')
                .map((i: number, el: Element) => $(el).text().trim())
                .get(),
            duration: $('.item-title:contains("Duration") .name').text().trim(),
            episodes: {
                sub: parseEpisodeCount($filmStats.find('.tick-item.tick-sub').text().trim()),
                dub: parseEpisodeCount($filmStats.find('.tick-item.tick-dub').text().trim()),
                total: parseEpisodeCount($filmStats.find('.tick-item.tick-eps').text().trim()),
            },
            malScore: $('.item-title:contains("MAL Score") .name').text().trim() || undefined,
            rating: $filmStats.find('.tick-item.tick-pg').text().trim() || undefined,
            quality: $filmStats.find('.tick-item.tick-quality').text().trim() || undefined,
            type: $('.dot').nextAll('.item').eq(0).text().trim() || undefined,
            characters: $('.bac-item')
                .map((i: number, el: Element) => {
                    const name = $(el).find('.pi-name').first().text().trim();
                    const role = $(el).find('.pi-cast').first().text().trim();
                    const voiceActorName = $(el).find('.rtl .pi-name').first().text().trim();
                    const voiceActorLanguage = $(el).find('.rtl .pi-cast').first().text().trim();

                    return {
                        name,
                        role,
                        voice_actor:
                            voiceActorName || voiceActorLanguage
                                ? {
                                    name: voiceActorName,
                                    language: voiceActorLanguage
                                }
                                : null
                    };
                })
                .get(),
            related_anime: $('.anif-block-ul li')
                .map((i: number, el: Element) => ({
                    title: $(el).find('.film-name a').text().trim(),
                    url: $(el).find('.film-name a').attr('href')?.trim() || '',
                    type: $(el).find('.fd-infor .tick').text().trim().split('\n').pop()?.trim() || ''
                }))
                .get(),
            promotional_videos: $('.block_area-promotions .item')
                .map((i: number, el: Element) => ({
                    title: $(el).data('title') as string || '',
                    url: $(el).data('src') as string || '',
                    thumbnail: $(el).find('.sit-img').attr('src') || ''
                }))
                .get(),
            seasons: $('.block_area-seasons .os-item')
                .map((i: number, el: Element) => ({
                    title: $(el).attr('title')?.trim() || '',
                    url: $(el).attr('href')?.trim() || '',
                    thumbnail: ($(el).find('.season-poster').css('background-image') || '')
                        .replace(/url\((['"])?(.*?)\1\)/gi, '$2')
                }))
                .get()
        };

        // Store in cache
        cache.set(cacheKey, animeInfo);

        return animeInfo;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Axios error while fetching ${url}:`, error.message);
        } else {
            console.error(`Unexpected error while fetching ${url}:`, error);
        }
        return null;
    }
};

// Example usage (Uncomment below lines to test)
/*
(async () => {
    const animeId = 'dandadan-19319'; // Replace with actual anime ID from URL
    const info = await fetchInfoZoro(animeId);
    console.log(JSON.stringify(info, null, 2));
})();
*/
