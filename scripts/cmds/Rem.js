const fs = require('fs');

// Initialize reply data
let replyData = {};

// Allowed user IDs to add replies (Admins)
const allowedUserIDs = ['61561400245668','61561175994395'];

// Try to read and parse the JSON file containing reply data
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
    role: 2, // Only admins are allowed to add replies (for public cases)
    author: "Allou Mohamed"
  },
  // Function to handle incoming chat messages
  onChat: async function({ message, event }) {
    const msgText = event.body.toLowerCase();
    // Check all replies regardless of sender's permission
    for (const trigger in replyData) {
      if (msgText.includes(trigger)) {
        const responses = replyData[trigger].responses;
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        message.reply(randomResponse);
        return; // Stop searching after the first matching reply
      }
    }
  },
  // Function to handle adding new replies
  onStart: async function({ message, args, event, api }) {
    const user = await api.getUserInfo(event.senderID);
    const userID = user[event.senderID]?.id || event.senderID;

    // Print user ID in the console for debugging
    console.log("User ID:", userID);

    // Allow only users with ID in allowedUserIDs or with the admin role
    if (!allowedUserIDs.includes(String(userID)) && user.role !== 2) {
      return message.reply("You do not have permission to add replies.");
    }

    // Create the JSON file if it doesn't exist
    if (!fs.existsSync('message_replies.json')) {
      fs.writeFileSync('message_replies.json', JSON.stringify(replyData, null, 2));
    }

    // Validate the format of the command
    if (args.length < 3 || args[1] !== "=>") {
      return message.reply("Invalid format. Use: `!command word1,word2,word3... => response1,response2,...`");
    }

    const triggerWords = args[0].split(',').map(word => word.trim());
    const responses = args.slice(2).join(' ').split(',').map(response => response.trim());

    // Add or update replies for the given trigger words
    triggerWords.forEach(word => {
      if (!replyData[word]) {
        replyData[word] = { responses };
      } else {
        replyData[word].responses = replyData[word].responses.concat(responses);
      }
    });

    // Write the updated reply data to the JSON file
    try {
      fs.writeFileSync('message_replies.json', JSON.stringify(replyData, null, 2));
      message.reply(`Added replies: ${triggerWords.join(", ")} => ${responses.join(", ")}`);
    } catch (error) {
      console.error('Error writing to JSON file:', error.message);
      message.reply("There was an error saving the replies. Please try again.");
    }
  }
};
