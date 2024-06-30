import { fetchData } from './fetchData';

interface SiteInfo {
    identifier: string;
    image: string;
    malId: number;
    aniId: number;
    page: string;
    title: string;
    type: string;
    url: string;
}

interface Sites {
    [key: string]: {
        [key: string]: SiteInfo;
    };
}

interface MappingResponse {
    id: number;
    type: string;
    title: string;
    url: string;
    total: number;
    image: string;
    malId: number;
    Sites: Sites;
}

const fetchMappings = async (id: string): Promise<MappingResponse | null> => {
    const url = `https://api.malsync.moe/mal/anime/anilist:${id}`;
    return await fetchData(url).then(data => data ?? null);
};

export default fetchMappings;
