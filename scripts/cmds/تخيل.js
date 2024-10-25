const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "تخيل",
    version: "1.0",
    role: 0, // متوافق مع نظام GoatBot، بدلاً من hasPermission
    credits: "jameslim",
    description: "Generate image from pollination",
    category: "image",
    guide: "{pn} [query]", // دليل الاستخدام
    cooldown: 2, // بدلاً من cooldowns
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");
    if (!query) return api.sendMessage("Please provide text/query.", threadID, messageID);

    const imagePath = path.join(__dirname, '/cache/poli.png');
    try {
      const response = await axios.get(`https://image.pollinations.ai/prompt/${query}`, {
        responseType: "arraybuffer",
      });

      fs.writeFileSync(imagePath, Buffer.from(response.data, "utf-8"));

      api.sendMessage({
        body: "Here is the image I generated:",
        attachment: fs.createReadStream(imagePath),
      }, threadID, () => fs.unlinkSync(imagePath), messageID);
    } catch (error) {
      api.sendMessage("Failed to generate image. Please try again later.", threadID, messageID);
    }
  }
};
