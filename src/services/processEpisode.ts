import fetchEpisode from './fetchEpisode';

const processEpisode = async (id: string, episodeNum: number) => {
    return await fetchEpisode(id, episodeNum);
};

export default processEpisode;
