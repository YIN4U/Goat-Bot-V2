const fs = require("fs");
const path = require("path");

// قراءة مسارات الصور من ملف JSON
const imagePaths = JSON.parse(fs.readFileSync(path.join(__dirname, "images.json"), "utf-8"));

module.exports = {
    config: {
        name: "phh",
        version: "1.7",
        author: "NTKhang",
        countDown: 5,
        role: 0,
        description: {
            vi: "Xem level của bạn hoặc người được tag. Có thể tag nhiều người",
            en: "View your level or the level of the tagged person. You can tag many people"
        },
        category: "rank",
        guide: {
            vi: "   [từ khóa]",
            en: "   [keyword]"
        },
        envConfig: {
            deltaNext: 5
        }
    },

    // تنفيذ الأمر بدون بادئة
    onStart: async function ({ message, args }) {
        const keyword = args[0]; // الكلمة المحددة من المستخدم
        const imagePath = imagePaths[keyword]; // الحصول على مسار الصورة بناءً على الكلمة

        // تحقق من وجود الصورة قبل إرسالها
        if (imagePath && fs.existsSync(imagePath)) {
            return message.reply({
                body: "إليك الصورة المحددة:",
                attachment: fs.createReadStream(imagePath)
            });
        } else {
            return message.reply("لم يتم العثور على الصورة أو الكلمة المحددة غير صحيحة.");
        }
    }
};
