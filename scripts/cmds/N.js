const fs = require("fs");

module.exports = {
    config: {
        name: "موسى",
        version: "1.1",
        author: "NTKhang",
        countDown: 5,
        role: 0,
        shortDescription: {
            en: "Protect Master"
        },
        description: {
            en: "Responds when certain phrases are mentioned"
        },
        category: "no prefix",
        guide: {
            en: "Just type specific words to trigger the response."
        }
    },

    langs: {
        en: {
            responseMessage: "أترك سيدي يرتاح 🔪😾"
        }
    },

    onEvent: async function ({ api, event }) {
        const { threadID, messageID, body } = event;

        // Check if the message starts with specific words
        if (body.startsWith("موسى") || body.startsWith("موسي") || body.startsWith("moussa") || body.startsWith("Test")) {
            const msg = {
                body: this.langs.en.responseMessage,
                attachment: fs.createReadStream(__dirname + `/Mou/welcome.jpeg`)
            };
            api.sendMessage(msg, threadID, messageID);
            api.setMessageReaction("😾", messageID, (err) => {}, true);
        }
    },

    onStart: async function () {
        // Empty since we are only using the onEvent function
    }
};