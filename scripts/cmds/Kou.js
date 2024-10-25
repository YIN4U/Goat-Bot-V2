const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "rank",
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
            vi: "   {pn} [để trống | @tags]",
            en: "   {pn} [empty | @tags]"
        },
        envConfig: {
            deltaNext: 5
        }
    },

    onStart: async function ({ message }) {
        // تحديد مسار الصورة الثابتة
        const imagePath = path.join(__dirname, "assets", "fixed-image.png");

        // تحقق من وجود الصورة قبل إرسالها
        if (fs.existsSync(imagePath)) {
            return message.reply({
                body: "إليك الصورة المحددة من المسار الثابت.",
                attachment: fs.createReadStream(imagePath)
            });
        } else {
            return message.reply("لم يتم العثور على الصورة في المسار المحدد.");
        }
    }
};
