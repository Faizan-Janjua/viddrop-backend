const express = require('express');
const router = express.Router();
const youtubedl = require('youtube-dl-exec');
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');

router.all('/', async (req, res) => {
  try {
    const { url, format_id, start_time, end_time, filename } =
      req.method === 'POST' ? req.body : req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const safeFilename =
      (filename || 'video').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.mp4';

    const ytdlOptions = {
      format: format_id || 'bestvideo+bestaudio/best',
      noCheckCertificates: true,
      noWarnings: true,
      addHeader: [
        'referer:https://www.tiktok.com/',
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ],
      concurrentFragments: 5,
      socketTimeout: 30
    };

    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const needsTrimming = !!(start_time || end_time);

    if (!needsTrimming && !isYouTube) {
      console.log(`[DEBUG] Direct YT-DLP path for ${url}`);

      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
      res.setHeader('Content-Type', 'video/mp4');

      const ytdlProcess = youtubedl.exec(url, {
        ...ytdlOptions,
        output: '-'
      });

      ytdlProcess.stdout.pipe(res);

      ytdlProcess.stderr.on('data', (data) => {
        const msg = data.toString();
        if (msg.includes('ERROR')) {
          console.error('[yt-dlp error]', msg);
        }
      });

      ytdlProcess.on('error', (err) => {
        console.error('[Direct download error]', err.message);
        if (!res.headersSent) {
          return res.status(500).json({ error: 'Direct download failed', message: err.message });
        }
        res.end();
      });

      return;
    }

    console.log(`[DEBUG] FFmpeg path for ${url}`);

    const info = await youtubedl(url, {
      getUrl: true,
      format: format_id || 'bestvideo+bestaudio/best',
      noCheckCertificates: true,
      addHeader: [
        'referer:https://www.tiktok.com/',
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });

    const urls = String(info)
      .trim()
      .split('\n')
      .filter(line => line.trim().length > 0);

    if (!urls.length) {
      return res.status(500).json({ error: 'No media stream URLs found' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Type', 'video/mp4');

    let command = ffmpeg();

    urls.forEach((streamUrl) => {
      if (start_time) {
        command = command.input(streamUrl.trim()).inputOptions(`-ss ${start_time}`);
      } else {
        command = command.input(streamUrl.trim());
      }
    });

    if (end_time) {
      const startSec = parseTimeToSeconds(start_time || '0');
      const endSec = parseTimeToSeconds(end_time);
      const duration = endSec - startSec;

      if (duration > 0) {
        command = command.setDuration(duration);
      }
    }

    command
      .format('mp4')
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-movflags frag_keyframe+empty_moov',
        '-preset ultrafast',
        '-tune zerolatency',
        '-crf 28',
        '-threads 0'
      ])
      .on('start', (cmd) => {
        console.log('[FFmpeg start]', cmd);
      })
      .on('error', (err) => {
        console.error('[FFmpeg error]', err.message);
        if (!res.headersSent) {
          return res.status(500).json({ error: 'Processing failed', message: err.message });
        }
        res.end();
      })
      .on('end', () => {
        console.log('[FFmpeg] Completed successfully');
      })
      .pipe(res, { end: true });

  } catch (error) {
    console.error('[Download route error]', error.message);
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Failed to process download',
        message: error.message
      });
    }
    res.end();
  }
});

function parseTimeToSeconds(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

module.exports = router;
