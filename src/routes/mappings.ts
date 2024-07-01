import express from 'express';
import { fetchMappings } from '../providers/malsync/fetchMappings';

const router = express.Router();

router.get('/', async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).send('Missing id');
    }

    try {
        const data = await fetchMappings(id as string);
        if (!data) {
            return res.status(404).send('Sites not found for the given ID');
        }
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching the mappings');
    }
});

export default router;
