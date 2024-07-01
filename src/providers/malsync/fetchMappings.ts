import { cache, fetchData } from '../../index';


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

export const fetchMappings = async (id: string): Promise<MappingResponse | null> => {
    const cacheKey = `mappings-${id}`;

    if (cache.has(cacheKey)) {
        console.log(`Fetching mappings for id ${id} from cache`);
        return cache.get(cacheKey) ?? null;
    }

    const url = `https://api.malsync.moe/mal/anime/anilist:${id}`;
    try {
        const data = await fetchData(url);
        if (data !== undefined) {
            cache.set(cacheKey, data);
            return data;
        }
        return null;
    } catch (error) {
        console.error('Error fetching mappings:', error);
        return null;
    }
};