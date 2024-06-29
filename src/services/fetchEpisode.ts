import axios from 'axios';
import * as cheerio from 'cheerio';
import fetchM3U8 from './fetchM3U8';
import cache from '../utils/cache';

interface Episode {
    episodeId: string;
    epNum: number;
    embed: string;
    m3u8: string | null;
    resolutions: { file: string, label: string }[] | null;
    downloadUrl: string | null;
}

const resolutionLabels: { [key: string]: string } = {
    '360': '360p',
    '480': '480p',
    '720': '720p',
    '1080': '1080p',
};

const fetchEpisode = async (gogoId: string, epNum: number): Promise<Episode[]> => {
    const episodes: Episode[] = [];

    const fetchEpisodeData = async (epNum: number) => {
        const epKey = `${gogoId}-episode-${epNum}`;
        if (cache.has(epKey)) {
            console.log(`Fetching episode ${epNum} from cache`);
            episodes.push(cache.get(epKey)!);
            return;
        }

        const epUrl = `https://anitaku.pe/${gogoId}-episode-${epNum}`;
        console.log(`Fetching episode from URL: ${epUrl}`);
        try {
            const res = await axios.get(epUrl);
            const $ = cheerio.load(res.data);
            const iframe = $('div.play-video iframe');
            const embed = iframe.attr('src');

            if (embed) {
                const { m3u8, resolutions, downloadUrl } = await fetchM3U8(embed);
                const formattedResolutions = resolutions?.map(file => {
                    const resMatch = file.match(/(\d+)\.m3u8$/);
                    const resLabel = resMatch && resolutionLabels[resMatch[1]] ? resolutionLabels[resMatch[1]] : 'unknown';
                    return { file, label: resLabel };
                }) || null;

                const episode: Episode = {
                    episodeId: epKey,
                    epNum,
                    embed,
                    m3u8,
                    resolutions: formattedResolutions,
                    downloadUrl,
                };
                episodes.push(episode);
                cache.set(epKey, episode);
                console.log(`\nEpisode ${epNum} embed: ${embed}`);
                console.log(`Episode ${epNum} m3u8: ${m3u8}`);
                console.log(`Episode ${epNum} resolutions: ${formattedResolutions?.map(r => `${r.label}: ${r.file}`).join(', ')}`);
                console.log(`Episode ${epNum} mp4 download URL: ${downloadUrl}\n`);
            } else {
                console.log(`embed link not found for episode ${epNum}`);
            }
        } catch (error) {
            console.error(`Error fetching episode ${epNum}:`, error);
        }
    };

    await fetchEpisodeData(epNum);

    return episodes;
};

export default fetchEpisode;
