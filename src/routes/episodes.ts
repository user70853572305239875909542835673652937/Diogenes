import express from 'express';
import fetchEpisode from '../services/fetchEpisode';

const router = express.Router();

router.get('/episodes', async (req, res) => {
    let gogoId = req.query.gogoId as string;
    const epNum = parseInt(req.query.ep as string, 10);
    const isDub = req.query.dub === 'true';

    if (!gogoId || isNaN(epNum)) {
        return res.status(400).json({ error: 'Invalid query parameters' });
    }

    // Modify gogoId if isDub is true
    const modifiedGogoId = isDub ? `${gogoId}-dub` : gogoId;

    try {
        const episodes = await fetchEpisode(modifiedGogoId, epNum);
        res.json({ gogoId: modifiedGogoId, episodes });
    } catch (error) {
        console.error(`[ERROR] Failed to fetch episodes:`, error);
        res.status(500).json({ error: 'Failed to fetch episodes' });
    }
});

export default router;
