const fs = require('fs');

let replyData = {};

try {
  const data = fs.readFileSync('message_replies.json', 'utf-8');
  replyData = JSON.parse(data);
} catch (error) {
  console.error('Error reading JSON file:', error.message);
}

module.exports = {
  config: {
    name: "🖌️",
    category: "utility",
    role: 2,
    author: "Allou Mohamed"
  },

  onChat: async function({ message, event }) {
    const msgText = event.body.toLowerCase() || event.body;

    // التحقق من جميع الردود بغض النظر عن المجموعة
    for (const trigger in replyData) {
      if (replyData[trigger].some(word => msgText.includes(word))) {
        message.reply(replyData[trigger].response);
        return; // نوقف البحث عند أول رد متطابق
      }
    }
  },

  onStart: async function({ message, args, event }) {
    if (!fs.existsSync('message_replies.json')) {
      fs.writeFileSync('message_replies.json', JSON.stringify(replyData, null, 2));
    }

    if (args.length < 3 || args[1] !== "=>") {
      return message.reply("Invalid format. Use: `!command word1,word2,word3... => response`");
    }

    const triggerWords = args[0].split(',').map(word => word.trim());
    const response = args.slice(2).join(' ');

    triggerWords.forEach(word => {
      replyData[word] = { response };
    });

    fs.writeFileSync('message_replies.json', JSON.stringify(replyData, null, 2));

    message.reply(`Added reply: ${triggerWords.join(", ")} => ${response}`);
  }
};