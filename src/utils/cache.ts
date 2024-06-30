interface Cache<T> {
    has: (key: string) => boolean;
    get: (key: string) => T | undefined;
    set: (key: string, value: T) => void;
}

const cacheMap = new Map<string, any>();

const createCache = <T>(): Cache<T> => ({
    has: (key: string) => cacheMap.has(key),
    get: (key: string) => cacheMap.get(key),
    set: (key: string, value: T) => cacheMap.set(key, value)
});

export default createCache;
