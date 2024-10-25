const axios = require("axios");
const ytdl = require("@distube/ytdl-core");
const fs = require("fs-extra");
const { getStreamFromURL, downloadFile, formatNumber } = global.utils;

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
		name: "play",
		version: "1.16",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: {
			vi: "Tải video, audio hoặc xem thông tin video trên YouTube",
			en: "Download video, audio or view video information on YouTube"
		},
		category: "media",
		guide: {
			vi: "   {pn} [video|-v] [<tên video>|<link video>]: dùng để tải video từ youtube."
				+ "\n   {pn} [audio|-a] [<tên video>|<link video>]: dùng để tải audio từ youtube"
				+ "\n   {pn} [info|-i] [<tên video>|<link video>]: dùng để xem thông tin video từ youtube"
				+ "\n   Ví dụ:"
				+ "\n    {pn} -v Fallen Kingdom"
				+ "\n    {pn} -a Fallen Kingdom"
				+ "\n    {pn} -i Fallen Kingdom",
			en: "   {pn} [video|-v] [<video name>|<video link>]: use to download video from youtube."
				+ "\n   {pn} [audio|-a] [<video name>|<video link>]: use to download audio from youtube"
				+ "\n   {pn} [info|-i] [<video name>|<video link>]: use to view video information from youtube"
				+ "\n   Example:"
				+ "\n    {pn} -v Fallen Kingdom"
				+ "\n    {pn} -a Fallen Kingdom"
				+ "\n    {pn} -i Fallen Kingdom"
		}
	},

	onReply: async ({ event, api, Reply, message, getLang }) => {
		const { result, type } = Reply;
		const choice = event.body;
		if (!isNaN(choice) && choice <= 6) {
			const infoChoice = result[choice - 1];
			const idvideo = infoChoice.id;
			const infoVideo = await getVideoInfo(idvideo);
			api.unsendMessage(Reply.messageID);
			await handle({ type, infoVideo, message, getLang });
		} else {
			api.unsendMessage(Reply.messageID);
		}
	}
};

async function handle({ type, infoVideo, message, getLang }) {
	const { title, videoId } = infoVideo;

	if (type == "video") {
		const MAX_SIZE = 83 * 1024 * 1024; // 83MB (max size of video that can be sent on fb)
		const msgSend = message.reply(getLang("downloading", getLang("video"), title));
		const { formats } = await ytdl.getInfo(videoId);
		const getFormat = formats
			.filter(f => f.hasVideo && f.hasAudio && f.quality == 'tiny' && f.audioBitrate == 128)
			.sort((a, b) => b.contentLength - a.contentLength)
			.find(f => f.contentLength || 0 < MAX_SIZE);
		if (!getFormat) return message.reply(getLang("noVideo"));
		const getStream = await getStreamAndSize(getFormat.url, `${videoId}.mp4`);
		if (getStream.size > MAX_SIZE) return message.reply(getLang("noVideo"));

		const savePath = __dirname + `/tmp/${videoId}_${Date.now()}.mp4`;
		const writeStrean = fs.createWriteStream(savePath);
		getStream.stream.pipe(writeStrean);

		writeStrean.on("finish", () => {
			message.reply({
				attachment: fs.createReadStream(savePath)
			}, async (err) => {
				if (err) return message.reply(getLang("error", err.message));
				fs.unlinkSync(savePath);
				message.unsend((await msgSend).messageID);
			});
		});
	}
	else if (type == "audio") {
		const MAX_SIZE = 27262976; // 26MB (max size of audio that can be sent on fb)
		const msgSend = message.reply(getLang("downloading", getLang("audio"), title));
		const { formats } = await ytdl.getInfo(videoId);
		const getFormat = formats
			.filter(f => f.hasAudio && !f.hasVideo)
			.sort((a, b) => b.contentLength - a.contentLength)
			.find(f => f.contentLength || 0 < MAX_SIZE);
		if (!getFormat) return message.reply(getLang("noAudio"));
		const getStream = await getStreamAndSize(getFormat.url, `${videoId}.mp3`);
		if (getStream.size > MAX_SIZE) return message.reply(getLang("noAudio"));

		const savePath = __dirname + `/tmp/${videoId}_${Date.now()}.mp3`;
		const writeStrean = fs.createWriteStream(savePath);
		getStream.stream.pipe(writeStrean);

		writeStrean.on("finish", () => {
			message.reply({
				attachment: fs.createReadStream(savePath)
			}, async (err) => {
				if (err) return message.reply(getLang("error", err.message));
				fs.unlinkSync(savePath);
				message.unsend((await msgSend).messageID);
			});
		});
	}
}
