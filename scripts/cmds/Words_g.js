const shuffle = (word) => {
  let shuffledWord = word.split('').sort(() => Math.random() - 0.5).join('');
  return shuffledWord === word ? shuffle(word) : shuffledWord;
};

module.exports = {
  config: {
    name: "word_scramble",
    version: "1.0.0",
    author: "YourName",
    cooldown: 5,
    role: 0,
    shortDescription: "Scramble words for users to guess.",
    longDescription: "Provides a scrambled word for users to unscramble.",
    category: "games",
    guide: "Use the command followed by a word to get a scrambled version of that word.",
  },
  onStart: async ({ api, event }) => {
    // Blank onStart function
  },
  onChat: async ({ api, event }) => {
    const { body, threadID, messageID } = event;
    const command = "/scramble";

    if (body.toLowerCase().startsWith(command)) {
      const word = body.slice(command.length).trim();
      if (word.length > 0) {
        const scrambledWord = shuffle(word);
        api.sendMessage(`Your scrambled word: ${scrambledWord}`, threadID, messageID);
      } else {
        api.sendMessage("Please provide a word to scramble.", threadID, messageID);
      }
    }
  },
};