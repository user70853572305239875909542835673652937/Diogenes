import express from 'express';
import { fetchInfo } from '../index';

const router = express.Router();

router.get('/', async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).send('Missing id');
    }

    try {
        const data = await fetchInfo(id as string);
        if (!data) {
            return res.status(404).send('Anime not found');
        }
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching anime information');
    }
});

export default router;
