import axios from 'axios';

const fetchResolutions = async (m3u8: string) => {
    try {
        const res = await axios.get(m3u8);
        const lines = res.data.split('\n');
        const baseUrl = m3u8.substring(0, m3u8.lastIndexOf('/') + 1);
        const qualityLinks = lines
            .filter((line: string) => line.endsWith('.m3u8'))
            .map((line: string) => baseUrl + line.trim());
        console.log('Extracted quality links:', qualityLinks);
        return qualityLinks;
    } catch (error) {
        console.error('Error fetching resolutions:', error);
        return [];
    }
};

export default fetchResolutions;
