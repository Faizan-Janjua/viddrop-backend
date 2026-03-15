const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

// Set ffmpeg path to the static binary
ffmpeg.setFfmpegPath(ffmpegStatic);

const trimVideo = (inputPath, outputPath, startTime, endTime) => {
    return new Promise((resolve, reject) => {
        let command = ffmpeg(inputPath);

        if (startTime) {
            command = command.setStartTime(startTime);
        }

        if (endTime) {
            const duration = parseTimeToSeconds(endTime) - parseTimeToSeconds(startTime || '00:00:00');
            command = command.setDuration(duration);
        }

        command
            .output(outputPath)
            .on('end', () => {
                console.log('Trimming finished');
                resolve(outputPath);
            })
            .on('error', (err) => {
                console.error('Error trimming video:', err);
                reject(err);
            })
            .run();
    });
};

const parseTimeToSeconds = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    } else {
        return parts[0];
    }
};

module.exports = { trimVideo };
