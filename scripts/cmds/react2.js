const fs = require('fs');

let shortReactData = {};

try {
  const data = fs.readFileSync('short_reactions.json', 'utf-8');
  shortReactData = JSON.parse(data);
} catch (error) {
  console.error('Error reading JSON file:', error.message);
}

module.exports = {
  config: {
    name: "تفاعل",
    category: "utility",
    role: 2,
    author: "Allou Mohamed"
  },

  onChat: async function({ message, event }) {
    const msgText = event.body.toLowerCase() || event.body;

    // التحقق من جميع التفاعلات بغض النظر عن المجموعة
    for (const emoji in shortReactData) {
      for (const word of shortReactData[emoji]) {
        if (msgText.includes(word)) {
          message.reaction(emoji, event.messageID);
          return; // نوقف البحث عند أول تفاعل
        }
      }
    }
  },

  onStart: async function({ message, args, event }) {
    if (!fs.existsSync('short.json')) {
      fs.writeFileSync('short_reactions.json', JSON.stringify(shortReactData, null, 2));
    }
    
    if (args.length < 3 || args[1] !== "=>") {
      return message.reply("Invalid format. Use: `!command word1,word2,word3... => 🙂`");
    }

    const emoji = args[0];
    const words = args.slice(2).join(' ').split(',').map(word => word.trim());

    if (!shortReactData[emoji]) {
      shortReactData[emoji] = words;
    } else {
      shortReactData[emoji] = shortReactData[emoji].concat(words);
    }

    fs.writeFileSync('short_reactions.json', JSON.stringify(shortReactData, null, 2));

    message.reply(`Added reaction: ${words.join(", ")} => ${emoji}`);
  }
};