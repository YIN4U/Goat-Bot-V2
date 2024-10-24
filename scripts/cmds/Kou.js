const axios = require("axios");
const fs = require("fs");

module.exports = {
    config: {
        name: "sendImage", // اسم الأمر
        version: "1.0",
        author: "YourName",
        countDown: 5,
        role: 0,
        shortDescription: {
            ar: "إرسال صورة"
        },
        description: {
            ar: "هذا الأمر يقوم بإرسال صورة"
        },
        category: "media",
        guide: {
            ar: "سيتم إرسال الصورة مع نص عند كتابة كلمة 'صورة' فقط"
        }
    },

    langs: {
        ar: {
            sendingImage: "جاري إرسال الصورة...",
            imageMessage: "⚜️|تم إرسال الصورة بنجاح!|⚜️"
        }
    },

    onStart: async function ({ api, message, getLang }) {
        // التحقق من وجود message.body قبل محاولة استخدامه
        if (message.body && message.body.trim().toLowerCase() === "صورة") {
            // قم بإرسال رسالة تنبيه
            message.reply(getLang("sendingImage"));

            // رابط الصورة التي تريد إرسالها
            const imageUrl = "https://i.postimg.cc/HWMsNNCk/dbc80b0bdfdebce4a5efc7a989aa9b9a.jpg";

            // تحميل الصورة وإرسالها
            const downloadImage = async (url, filePath) => {
                const response = await axios({
                    url,
                    method: 'GET',
                    responseType: 'stream'
                });
                response.data.pipe(fs.createWriteStream(filePath));
                return new Promise((resolve, reject) => {
                    response.data.on('end', () => resolve());
                    response.data.on('error', err => reject(err));
                });
            };

            const filePath = __dirname + "/tmp/image.jpg";
            await downloadImage(imageUrl, filePath);

            // إرسال الصورة مع نص
            api.sendMessage({
                body: getLang("imageMessage"), // نص الرسالة
                attachment: fs.createReadStream(filePath) // ملحق الصورة
            }, message.threadID);
        }
    }
};
