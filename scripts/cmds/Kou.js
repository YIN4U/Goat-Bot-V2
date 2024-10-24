module.exports = {
    config: {
        name: "sendi", // اسم الأمر
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
            ar: "سيتم إرسال الصورة عند كتابة كلمة 'صورة' فقط"
        }
    },

    langs: {
        ar: {
            sendingImage: "جاري إرسال الصورة..."
        }
    },

    onStart: async function ({ api, message, getLang }) {
        // التحقق إذا كانت الرسالة تساوي "صورة"
        if (message.body.trim().toLowerCase() === "صورة") {
            // قم بإرسال رسالة تنبيه
            message.reply(getLang("sendingImage"));

            // رابط الصورة التي تريد إرسالها
            const imageUrl = "https://i.postimg.cc/HWMsNNCk/dbc80b0bdfdebce4a5efc7a989aa9b9a.jpg";

            // تحميل الصورة وإرسالها
            const axios = require('axios'); // تأكد من تثبيت axios في بيئتك
            const fs = require('fs');

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

            const filePath = "cache/dbc80b0bdfdebce4a5efc7a989aa9b9a.jpg";
            await downloadImage(imageUrl, filePath);

            // إرسال الصورة
            api.sendMessage({
                body: "تم إرسال الصورة بنجاح!",
                attachment: fs.createReadStream(filePath)
            }, message.threadID);
        }
    }
};