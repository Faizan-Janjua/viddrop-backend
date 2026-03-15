const express = require('express');
const router = express.Router();
const youtubedl = require('youtube-dl-exec');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

ffmpeg.setFfmpegPath(ffmpegStatic);

router.all('/', async (req, res) => {
    try {
        const { url, format_id, start_time, end_time, filename } = req.method === 'POST' ? req.body : req.query;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const safeFilename = (filename || 'video').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.mp4';

        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
        res.setHeader('Content-Type', 'video/mp4');

        const ytdlOptions = {
            format: format_id || 'bestvideo+bestaudio/best',
            noCheckCertificates: true,
            noWarnings: true,
            addHeader: [
                'referer:https://www.tiktok.com/',
                'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ],
            concurrentFragments: 5, // Speed up download with multiple fragments
            socketTimeout: 30,
        };

        // EXTREME SPEED OPTIMIZATION: Dual-Path Logic
        // 1. Direct Pipeline: For Non-Trimming & Single-Stream platforms (TikTok, FB, IG) - INSTANT
        // 2. Optimized FFmpeg: For YouTube HD or Trimming - ULTRAFAST

        const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
        const needsTrimming = !!(start_time || end_time);

        // Path 1: World's Fastest (Direct stdout pipe from yt-dlp)
        // Use this for single-stream platforms when NO trimming is requested.
        if (!needsTrimming && !isYouTube) {
            console.log(`[DEBUG] Path: World's Fastest (Direct YT-DLP) for ${url}`);

            const ytdlProcess = youtubedl.exec(url, {
                ...ytdlOptions,
                output: '-',
            });

            ytdlProcess.stdout.pipe(res);

            ytdlProcess.stderr.on('data', (data) => {
                if (data.toString().includes('ERROR')) console.error(`[yt-dlp error] ${data}`);
            });

            ytdlProcess.on('error', (err) => {
                if (!res.headersSent) res.status(500).send('Direct download failed');
            });
            return;
        }

        // Path 2: Optimized Merging/Trimming (FFmpeg)
        // Necessary for YouTube HD (separate video/audio) or when cropping time.
        console.log(`[DEBUG] Path: Optimized FFmpeg for ${url}`);

        try {
            const info = await youtubedl(url, {
                getUrl: true,
                format: format_id || 'bestvideo+bestaudio/best',
                noCheckCertificates: true,
                addHeader: [
                    'referer:https://www.tiktok.com/',
                    'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                ],
            });

            const urls = info.trim().split('\n').filter(line => line.trim().length > 0);

            let command = ffmpeg();
            urls.forEach(streamUrl => {
                if (start_time) {
                    command = command.input(streamUrl.trim()).inputOptions(`-ss ${start_time}`);
                } else {
                    command = command.input(streamUrl.trim());
                }
            });

            if (end_time) {
                const startSec = parseTimeToSeconds(start_time || '0');
                const endSec = parseTimeToSeconds(end_time);
                command = command.setDuration(endSec - startSec);
            }

            command
                .format('mp4')
                .videoCodec('libx264')
                .audioCodec('aac')
                .outputOptions([
                    '-movflags frag_keyframe+empty_moov',
                    '-preset ultrafast', // ABSOLUTE FASTEST PRESET
                    '-tune zerolatency', // ELIMINATE BUFFERING DELAY
                    '-crf 28',            // Optimize for speed over tiny file size
                    '-threads 0'          // USE ALL CPU CORES
                ])
                .on('error', (err) => {
                    console.error('[ERROR] FFmpeg error:', err.message);
                    if (!res.headersSent) res.status(500).send('Processing failed');
                })
                .pipe(res, { end: true });

        } catch (err) {
            console.error('[ERROR] Download failed:', err.message);
            if (!res.headersSent) res.status(500).send('Speed-up extraction failed');
        }

    } catch (error) {
        console.error('Download route error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to process download', message: error.message });
        }
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
