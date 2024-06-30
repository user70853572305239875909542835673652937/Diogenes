import axios from 'axios';
import * as cheerio from 'cheerio';
import fetchM3U8, { type FetchM3U8Result } from './fetchM3U8';
import cache from '../utils/cache';

interface Episode {
    id: string;
    number: number;
    embed: string;
    m3u8: string | null;
    resolutions: { url: string, label: string }[] | null;
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
        console.log(`Fetching episode from URL: ${episodeUrl}`);
        try {
            const response = await axios.get(episodeUrl);
            const $ = cheerio.load(response.data);
            const iframe = $('div.play-video iframe');
            const embed = iframe.attr('src');

            if (embed) {
                const { m3u8, resolutions, downloadUrl }: FetchM3U8Result = await fetchM3U8(embed);
                const formattedResolutions = resolutions?.map((url: string) => {
                    const resolutionMatch = url.match(/(\d+)\.m3u8$/);
                    const resolutionLabel = resolutionMatch && resolutionLabels[resolutionMatch[1]] ? resolutionLabels[resolutionMatch[1]] : 'unknown';
                    return { url, label: resolutionLabel };
                }) || null;

                const episode: Episode = {
                    id: cacheKey,
                    number: episodeNumber,
                    embed,
                    m3u8: m3u8,
                    resolutions: formattedResolutions,
                    downloadUrl,
                };
                episodes.push(episode);
                cache.set(cacheKey, episode);
                console.log(`\nEpisode ${episodeNumber} embed: ${embed}`);
                console.log(`Episode ${episodeNumber} m3u8: ${m3u8}`);
                console.log(`Episode ${episodeNumber} resolutions: ${formattedResolutions?.map((r: { label: string, url: string }) => `${r.label}: ${r.url}`).join(', ')}`);
                console.log(`Episode ${episodeNumber} mp4 download URL: ${downloadUrl}\n`);
            } else {
                console.log(`Embed URL not found for episode ${episodeNumber}`);
            }
        } catch (error) {
            console.error(`Error fetching episode ${episodeNumber}:`, error);
        }
    };

    await retrieveEpisode(episodeNumber);

    return episodes;
};

export default fetchEpisode;
