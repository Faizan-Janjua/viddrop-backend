const express = require('express');
const router = express.Router();

const { getVideoInfo } = require('../services/ytdlp');

router.post('/', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        const info = await getVideoInfo(url);
        res.json(info);
    } catch (error) {
        console.error('Info route error:', error);
        res.status(500).json({ error: 'Failed to fetch video info', message: error.message });
    }
});

module.exports = router;
