export interface Episode {
    episodeId: string;
    epNum: number;
    embed: string;
    m3u8: string | null;
    resolutions: { file: string, label: string }[] | null;
    downloadUrl: string | null;
}

const cache = new Map<string, Episode>();

export default cache;
