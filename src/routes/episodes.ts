import express from 'express';
import processEpisode from '../providers/gogoanime/processEpisode';

const router = express.Router();

router.get('/', async (req, res) => {
    const { id, ep } = req.query;

    if (!id || !ep) {
        return res.status(400).send('Missing id or episode number');
    }

    try {
        const episode = await processEpisode(id as string, parseInt(ep as string));
        res.json({ id, ep, episode });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching the episode data');
    }
});

export default router;
