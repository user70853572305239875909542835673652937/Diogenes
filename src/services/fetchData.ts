import axios from 'axios';

export const fetchData = async (url: string) => {
    try {
        const res = await axios.get(url);
        return res.data;
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        throw error;
    }
};
