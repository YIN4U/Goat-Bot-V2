const ytdl = require('ytdl-core');
const { MessageAttachment } = require('discord.js');

// Function to get video info and prepare to play the audio
async function getVideoInfo(url) {
    try {
        const json = await ytdl.getInfo(url);

        // Handle cases where videoDetails might be undefined
        const videoDetails = json.videoDetails || {};
        const title = videoDetails.title || "Unknown Title";
        const author = videoDetails.author?.name || "Unknown Author";
        const duration = videoDetails.lengthSeconds || "Unknown Duration";

        console.log(`Title: ${title}`);
        console.log(`Author: ${author}`);
        console.log(`Duration: ${duration} seconds`);

        // Prepare the audio stream
        const audioStream = ytdl(url, { filter: 'audioonly' });

        // Do something with the audio stream, e.g., play it in a voice channel
        return audioStream;

    } catch (error) {
        console.error("Failed to fetch video information:", error);

        // Fallback to just playing the audio without needing the video details
        const audioStreamFallback = ytdl(url, { filter: 'audioonly' });
        return audioStreamFallback;
    }
}

// Example command function that uses the getVideoInfo function
module.exports = {
    name: 'شغل',
    description: 'Play a YouTube audio in a voice channel',
    async execute(message, args) {
        const url = args[0];
        if (!url) {
            return message.reply('Please provide a valid YouTube URL.');
        }

        try {
            const audioStream = await getVideoInfo(url);

            // Now you can pipe the audioStream to the voice connection or any other handler
            const dispatcher = message.guild.voice?.connection.play(audioStream);
            dispatcher.on('finish', () => console.log('Audio has finished playing.'));

            message.reply(`Now playing audio from ${url}`);

        } catch (error) {
            console.error("Error while playing the audio:", error);
            message.reply('There was an error trying to play the audio.');
        }
    }
};
