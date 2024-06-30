import axios from 'axios';
import * as cheerio from 'cheerio';
import fetchM3U8, { type FetchM3U8Result } from './fetchM3U8';
import { cache } from '../../utils/cacheSetup';

interface Episode {
    id: string;
    number: number;
    embed: string;
    m3u8: string | null;
    downloadUrl: string | null;
}

const resolutionLabels: { [key: string]: string } = {
    '360': '360p',
    '480': '480p',
    '720': '720p',
    '1080': '1080p',
};

const fetchEpisode = async (animeId: string, episodeNumber: number): Promise<Episode[]> => {
    const episodes: Episode[] = [];

    const retrieveEpisode = async (episodeNumber: number) => {
        const cacheKey = `${animeId}-episode-${episodeNumber}`;
        if (cache.has(cacheKey)) {
            console.log(`Fetching episode ${episodeNumber} from cache`);
            episodes.push(cache.get(cacheKey)!);
            return;
        }

        const episodeUrl = `https://anitaku.pe/${animeId}-episode-${episodeNumber}`;
        try {
            const response = await axios.get(episodeUrl);
            const $ = cheerio.load(response.data);
            const iframe = $('div.play-video iframe');
            const embed = iframe.attr('src');

            if (embed) {
                const { m3u8, downloadUrl }: FetchM3U8Result = await fetchM3U8(embed);


                const episode: Episode = {
                    id: cacheKey,
                    number: episodeNumber,
                    embed,
                    m3u8,
                    downloadUrl,
                };
                episodes.push(episode);
                cache.set(cacheKey, episode);
            }
        } catch (error) {
            console.error(`Error fetching episode ${episodeNumber}:`, error);
        }
    };

    await retrieveEpisode(episodeNumber);

    return episodes;
};

export default fetchEpisode;
