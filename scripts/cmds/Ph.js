const fs = require('fs');

module.exports = {
  config: {
    name: "بوت",
    version: "2.0.0",
    author: "Haru",
    cooldown: 5,
    role: 0,
    shortDescription: "الرد التلقائي مع ردود الفعل والردود",
    longDescription: "الرد التلقائي مع ردود الفعل والردود بناءً على كلمات أو مشغلات محددة.",
    category: "النظام",
    guide: "©بوت",
  },
  onStart: async ({ api, event }) => {
    // Blank onStart function as per the request
  },
  onChat: async ({ api, event }) => {
    const { body, messageID, threadID } = event;
    // Reactions based on words
    const emojis = {
      "😽": ["مياو"],
    };
    // Replies to specific words
    const replies = {
      "hi": "hello",
    };
    // Images to send based on words
    const images = {
      "موسى": "Mou/welcome.jpeg",
      "dragon": "Mou/dragon.mp3",
    };

    // React based on words
    for (const [emoji, words] of Object.entries(emojis)) {
      for (const word of words) {
        if (body.toLowerCase().includes(word)) {
          api.setMessageReaction(emoji, messageID, () => {}, true);
        }
      }
    }
    // Reply based on triggers
    for (const [trigger, reply] of Object.entries(replies)) {
      if (body.toLowerCase().includes(trigger)) {
        api.sendMessage(reply, threadID, messageID);
      }
    }
    // Send image based on words
    for (const [trigger, imagePath] of Object.entries(images)) {
      if (body.toLowerCase().includes(trigger)) {
        const imageBuffer = fs.readFileSync(imagePath);
        api.sendMessage({
          body: "",
          attachment: fs.createReadStream(imagePath)
        }, threadID, messageID);
      }
    }
  },
};
