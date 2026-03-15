const youtubedl = require('youtube-dl-exec');

const getVideoInfo = async (url) => {
    try {
        console.log(`Extracting info for: ${url}`);
        const output = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: [
                'referer:https://www.tiktok.com/',
                'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ],
            // Use impersonate if supported (newer yt-dlp versions)
            // impersonate: 'chrome', 
        });

        if (!output) {
            throw new Error('No metadata returned from video extraction tool.');
        }

        // Map relevant fields with safety checks
        return {
            platform: detectPlatform(url),
            title: output.title || 'Untitled Video',
            duration: output.duration || 0,
            thumbnail: output.thumbnail || output.thumbnails?.[0]?.url || '',
            author: output.uploader || output.uploader_id || output.channel || 'Unknown',
            formats: (output.formats || []).map(f => ({
                format_id: f.format_id,
                extension: f.ext,
                quality: f.format_note || (f.height ? f.height + 'p' : 'Best'),
                filesize: f.filesize || f.filesize_approx || 0,
                hasVideo: f.vcodec !== 'none',
                hasAudio: f.acodec !== 'none'
            })).filter(f => f.hasVideo || f.hasAudio)
        };
    } catch (error) {
        console.error('Error fetching video info:', error.message);
        throw error;
    }
};

const detectPlatform = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('facebook.com') || url.includes('fb.watch')) return 'Facebook';
    return 'Generic';
};

module.exports = { getVideoInfo, detectPlatform };
