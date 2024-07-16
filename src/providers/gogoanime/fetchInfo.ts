import axios from 'axios';
import cheerio, { type CheerioAPI } from 'cheerio';
import { cache } from '../../index';

export const fetchInfoGogo = async (id: string) => {
    const cacheKey = `gogo:${id}`;

    if (cache.has(cacheKey)) {
        console.log(`Fetching anime info for id ${id} from cache`);
        return cache.get(cacheKey);
    }

    const url = `https://anitaku.pe/category/${id}`;

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const animeInfo = {
            id,
            title: $('div.anime_info_body_bg h1').text().trim(),
            image: $('div.anime_info_body_bg img').attr('src'),
            type: $('p.type:contains("Type:") a').text().trim(),
            description: $('div.description p').text().trim(),
            genre: $('p.type:contains("Genre:") a').map((i, el) => $(el).text().trim()).get().join(', '),
            released: $('p.type:contains("Released:")').text().replace('Released: ', '').trim(),
            status: $('p.type:contains("Status:") a').text().trim(),
            otherNames: $('p.type.other-name a').map((i, el) => $(el).text().trim()).get().join(', '),
            episodes: getTotalEpisodes($),
        };

        cache.set(cacheKey, animeInfo);

        return {
            id: animeInfo.id,
            title: animeInfo.title,
            image: animeInfo.image,
            type: animeInfo.type,
            description: animeInfo.description,
            genre: animeInfo.genre,
            released: animeInfo.released,
            status: animeInfo.status,
            otherNames: animeInfo.otherNames,
            episodes: animeInfo.episodes,
        };
    } catch (error) {
        console.error('Error fetching anime info:', error);
        return null;
    }
};

/**
 * Get the total number of episodes by finding the last episode number in the list.
 * @param $ - Cheerio instance
 * @returns {number} - Total number of episodes
 */
const getTotalEpisodes = ($: CheerioAPI): number => {
    const lastEpisodeElement = $('#episode_page li a').last();
    const epEnd = parseInt(lastEpisodeElement.attr('ep_end') || '0', 10);
    return isNaN(epEnd) ? 0 : epEnd;
};
