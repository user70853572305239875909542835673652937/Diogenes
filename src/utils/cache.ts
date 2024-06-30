interface Episode {
    id: string;
    number: number;
    embed: string;
    m3u8: string | null;
    resolutions: { url: string, label: string }[] | null;
    downloadUrl: string | null;
}

const cache = new Map<string, Episode>();

export default {
    has: (key: string) => cache.has(key),
    get: (key: string) => cache.get(key),
    set: (key: string, value: Episode) => cache.set(key, value),
};
