const express = require('express');
const router = express.Router();
const youtubedl = require('youtube-dl-exec');

router.get('/', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificates: true
    });

    const formats = info.formats
      .filter(f => f.ext === 'mp4' && f.vcodec !== 'none')
      .map(f => ({
        format_id: f.format_id,
        quality: f.format_note || f.height + 'p',
        ext: f.ext,
        filesize: f.filesize || f.filesize_approx
      }));

    res.json({
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration,
      formats
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to fetch info',
      message: err.message
    });
  }
});

module.exports = router;
