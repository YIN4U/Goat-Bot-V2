const axios = require("axios");
const ytdl = require("@distube/ytdl-core");
const fs = require("fs-extra");

async function getStreamAndSize(url, path = "") {
	const response = await axios({
		method: "GET",
		url,
		responseType: "stream",
		headers: {
			'Range': 'bytes=0-'
		}
	});
	if (path) response.data.path = path;
	const totalLength = response.headers["content-length"];
	return {
		stream: response.data,
		size: totalLength
	};
}

module.exports = {
	config: {
		name: "شغل",
		version: "1.16",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: {
			en: "Download video or audio from YouTube"
		},
		category: "media",
		guide: {
			en: "   {pn} [video|-v] [<video link>]: use to download video from YouTube."
				+ "\n   {pn} [audio|-a] [<video link>]: use to download audio from YouTube"
		}
	},

	onStart: async function ({ args, message }) {
		let type;
		switch (args[0]) {
			case "-v":
			case "video":
				type = "video";
				break;
			case "-a":
			case "audio":
				type = "audio";
				break;
			default:
				return message.SyntaxError();
		}

		const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
		const urlYtb = checkurl.test(args[1]);

		if (urlYtb) {
			const videoId = extractVideoId(args[1]);
			handle({ type, videoId, message });
			return;
		} else {
			return message.reply("Invalid YouTube link.");
		}
	}
};

async function handle({ type, videoId, message }) {
	if (type === "video") {
		const MAX_SIZE = 83 * 1024 * 1024; // 83MB
		const { formats } = await ytdl.getInfo(videoId);
		const getFormat = formats
			.filter(f => f.hasVideo && f.hasAudio && f.quality === 'tiny' && f.audioBitrate === 128)
			.sort((a, b) => b.contentLength - a.contentLength)
			.find(f => f.contentLength && f.contentLength < MAX_SIZE);
		if (!getFormat) return message.reply("No suitable video format found.");

		const getStream = await getStreamAndSize(getFormat.url, `${videoId}.mp4`);
		if (getStream.size > MAX_SIZE) return message.reply("Video size exceeds the limit.");

		const savePath = __dirname + `/tmp/${videoId}_${Date.now()}.mp4`;
		const writeStream = fs.createWriteStream(savePath);
		getStream.stream.pipe(writeStream);

		writeStream.on("finish", () => {
			message.reply({
				attachment: fs.createReadStream(savePath)
			}, async (err) => {
				if (err) return message.reply("Error sending video.");
				fs.unlinkSync(savePath);
			});
		});
	} else if (type === "audio") {
		const MAX_SIZE = 27262976; // 26MB
		const { formats } = await ytdl.getInfo(videoId);
		const getFormat = formats
			.filter(f => f.hasAudio && !f.hasVideo)
			.sort((a, b) => b.contentLength - a.contentLength)
			.find(f => f.contentLength && f.contentLength < MAX_SIZE);
		if (!getFormat) return message.reply("No suitable audio format found.");

		const getStream = await getStreamAndSize(getFormat.url, `${videoId}.mp3`);
		if (getStream.size > MAX_SIZE) return message.reply("Audio size exceeds the limit.");

		const savePath = __dirname + `/tmp/${videoId}_${Date.now()}.mp3`;
		const writeStream = fs.createWriteStream(savePath);
		getStream.stream.pipe(writeStream);

		writeStream.on("finish", () => {
			message.reply({
				attachment: fs.createReadStream(savePath)
			}, async (err) => {
				if (err) return message.reply("Error sending audio.");
				fs.unlinkSync(savePath);
			});
		});
	}
}

function extractVideoId(url) {
	const id = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/|\/shorts\/)/);
	return id[2] !== undefined ? id[2].split(/[^0-9a-z_\-]/i)[0] : id[0];
}
