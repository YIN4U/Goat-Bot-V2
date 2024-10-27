const axios = require("axios");
const ytdl = require("@distube/ytdl-core");
const fs = require("fs-extra");
const path = require("path");

async function getStreamAndSize(url, filePath = "") {
    const response = await axios({
        method: "GET",
        url,
        responseType: "stream",
        headers: {
            'Range': 'bytes=0-'
        }
    });
    if (filePath) response.data.path = filePath;
    const totalLength = response.headers["content-length"];
    return {
        stream: response.data,
        size: parseInt(totalLength, 10)
    };
}

module.exports = {
    config: {
        name: "ytb",
        version: "1.16",
        author: "NTKhang",
        countDown: 5,
        role: 0,
        category: "media",
        description: {
            en: "Download video, audio or view video information on YouTube",
            ar: "تحميل الفيديو أو الصوت أو مشاهدة معلومات الفيديو من YouTube"
        },
        guide: {
            en: "Use the command to download video or audio from YouTube",
            ar: "استخدام الأمر لتنزيل الفيديو أو الصوت من YouTube"
        }
    },

    onStart: async () => {
        // يمكن إضافة أي أكواد تهيئة هنا إذا لزم الأمر
        return;
    },

    onReply: async ({ event, api, Reply, message }) => {
        const { result, type } = Reply;
        const choice = event.body;
        if (!isNaN(choice) && choice <= 6) {
            const infoChoice = result[choice - 1];
            const idvideo = infoChoice.id;
            const infoVideo = await getVideoInfo(idvideo);
            api.unsendMessage(Reply.messageID);
            await handle({ type, infoVideo, message });
        } else {
            api.unsendMessage(Reply.messageID);
        }
    }
};

async function handle({ type, infoVideo, message }) {
    const { videoId } = infoVideo;
    const tmpDir = path.join(__dirname, "tmp");
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir);
    }

    if (type === "video") {
        const MAX_SIZE = 83 * 1024 * 1024; // 83MB
        const { formats } = await ytdl.getInfo(videoId);
        const getFormat = formats
            .filter(f => f.hasVideo && f.hasAudio && f.quality === 'tiny' && f.audioBitrate === 128)
            .sort((a, b) => b.contentLength - a.contentLength)
            .find(f => f.contentLength < MAX_SIZE);
        if (!getFormat) return message.reply("لا يمكن تحميل الفيديو المطلوب.");

        const savePath = path.join(tmpDir, `${videoId}_${Date.now()}.mp4`);
        const getStream = await getStreamAndSize(getFormat.url, savePath);

        if (getStream.size > MAX_SIZE) return message.reply("لا يمكن تحميل الفيديو المطلوب.");

        const writeStream = fs.createWriteStream(savePath);
        getStream.stream.pipe(writeStream);

        writeStream.on("finish", () => {
            message.reply({
                body: "هذا طلبك:",
                attachment: fs.createReadStream(savePath)
            }, async (err) => {
                if (err) {
                    console.error("Error sending video:", err);
                    return message.reply("حدث خطأ أثناء إرسال الفيديو.");
                }
                fs.unlinkSync(savePath);
            });
        });

        writeStream.on("error", (err) => {
            console.error("Write stream error:", err);
            message.reply("حدث خطأ أثناء تحميل الفيديو.");
        });
    } else if (type === "audio") {
        const MAX_SIZE = 26 * 1024 * 1024; // 26MB
        const { formats } = await ytdl.getInfo(videoId);
        const getFormat = formats
            .filter(f => f.hasAudio && !f.hasVideo)
            .sort((a, b) => b.contentLength - a.contentLength)
            .find(f => f.contentLength < MAX_SIZE);
        if (!getFormat) return message.reply("لا يمكن تحميل الصوت المطلوب.");

        const savePath = path.join(tmpDir, `${videoId}_${Date.now()}.mp3`);
        const getStream = await getStreamAndSize(getFormat.url, savePath);

        if (getStream.size > MAX_SIZE) return message.reply("لا يمكن تحميل الصوت المطلوب.");

        const writeStream = fs.createWriteStream(savePath);
        getStream.stream.pipe(writeStream);

        writeStream.on("finish", () => {
            message.reply({
                body: "هذا طلبك:",
                attachment: fs.createReadStream(savePath)
            }, async (err) => {
                if (err) {
                    console.error("Error sending audio:", err);
                    return message.reply("حدث خطأ أثناء إرسال الصوت.");
                }
                fs.unlinkSync(savePath);
            });
        });

        writeStream.on("error", (err) => {
            console.error("Write stream error:", err);
            message.reply("حدث خطأ أثناء تحميل الصوت.");
        });
    }
}
