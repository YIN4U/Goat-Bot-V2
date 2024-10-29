const fs = require('fs');

let replyData = {};

// المعرفات المسموح لها بإضافة ردود
const allowedUserIDs = ['61561400245668']; 

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
    role: 2, // يسمح فقط للأدمن بإضافة الردود (للحالات العامة)
    author: "Allou Mohamed"
  },

  onChat: async function({ message, event }) {
    const msgText = event.body.toLowerCase() || event.body;

    // التحقق من جميع الردود بغض النظر عن صلاحية المرسل
    for (const trigger in replyData) {
      if (msgText.includes(trigger)) {
        const responses = replyData[trigger].responses;
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        message.reply(randomResponse);
        return; // نوقف البحث عند أول رد متطابق
      }
    }
  },

  onStart: async function({ message, args, event, user }) {
    // السماح فقط للمستخدمين الذين لديهم معرف في allowedUserIDs
    if (!user || (!allowedUserIDs.includes(user.id) && user.role < 2)) {
      return message.reply("You do not have permission to add replies.");
    }

    if (!fs.existsSync('message_replies.json')) {
      fs.writeFileSync('message_replies.json', JSON.stringify(replyData, null, 2));
    }

    if (args.length < 3 || args[1] !== "=>") {
      return message.reply("Invalid format. Use: `!command word1,word2,word3... => response1,response2,...`");
    }

    const triggerWords = args[0].split(',').map(word => word.trim());
    const responses = args.slice(2).join(' ').split(',').map(response => response.trim());

    triggerWords.forEach(word => {
      if (!replyData[word]) {
        replyData[word] = { responses };
      } else {
        replyData[word].responses = replyData[word].responses.concat(responses);
      }
    });

    fs.writeFileSync('message_replies.json', JSON.stringify(replyData, null, 2));

    message.reply(`Added replies: ${triggerWords.join(", ")} => ${responses.join(", ")}`);
  }
};
