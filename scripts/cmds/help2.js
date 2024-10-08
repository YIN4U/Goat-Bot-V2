module.exports = {
  config: {
    name: "مساعدة",
    version: "1.0.2",
    author: "YIN YAN",
    role: 0, // تعادل hasPermssion في الكود القديم
    description: {
      en: "YIN YAN Tech 49"
    },
    category: "system",
    guide: {
      en: "[Name module]"
    },
    countDown: 5, // تعادل cooldowns في الكود القديم
    envConfig: {
      autoUnsend: true,
      delayUnsend: 20
    }
  },

  langs: {
    en: {
      moduleInfo: "「 %1 」\n%2\n\n❯ Usage: %3\n❯ Category: %4\n❯ Waiting time: %5 seconds(s)\n❯ Permission: %6\n\n» Module code by %7 «",
      helpList: '[ There are %1 commands on this bot, Use: "%2help nameCmd" to know how to use! ]',
      user: "User",
      adminGroup: "Admin group",
      adminBot: "Admin bot"
    }
  },

  onStart: async function ({ message, event, args, getLang, api }) {
    const cmds = global.client?.cmds;
    const threadData = global.data?.threadData;
    
    if (!cmds || !threadData) {
        return message.reply("An error occurred: cmds or thread data is not available.");
    }

    const { threadID, messageID } = event;
    const cmd = cmds.get((args[0] || "").toLowerCase());
    const threadSetting = threadData.get(parseInt(threadID)) || {};
    const { autoUnsend, delayUnsend } = global.configModule[this.config.name];
    const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;

    if (!cmd) {
        const arrayInfo = [];
        const page = parseInt(args[0]) || 1;
        const numberOfOnePage = 9999;
        let i = 0;
        let msg = "⭓════════════⭓\n𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗟𝗜𝗦𝗧 \n⭓════════════⭓\n▬▬▬▬▬▬▬▬▬▬▬▬\n";

        for (const [name] of cmds) {
          arrayInfo.push(name);
        }

        arrayInfo.sort((a, b) => a.data - b.data);

        const startSlice = numberOfOnePage * page - numberOfOnePage;
        i = startSlice;
        const returnArray = arrayInfo.slice(startSlice, startSlice + numberOfOnePage);

        for (let item of returnArray) msg += `   │  ${++i} ☯️ ${item}\n`;
        const randomText = ["hy bhy baby", "g", "h"];
        const text = `▬▬▬▬▬▬▬▬▬▬▬▬\n⭓════════════⭓\n✿ 𝐏𝐀𝐆𝐄   (${page}/${Math.ceil(arrayInfo.length / numberOfOnePage)})✿\n╰──────╯\n𝗧𝘆𝗽𝗲: °${prefix}𝗛𝗲𝗹𝗽°\n𝗧𝗼𝘁𝗮𝗹 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀: ${arrayInfo.length} \n✿▬▬▬▬▬▬▬▬▬▬▬▬✿  \n⭓════════════⭓\n⭓YIN YAN⭓\n⭓════════════⭓\n`;
        return api.sendMessage(msg + text, threadID, async (error, info) => {
            if (autoUnsend) {
              await new Promise(resolve => setTimeout(resolve, delayUnsend * 10000));
              return api.unsendMessage(info.messageID);
            }
        });
    }

    return api.sendMessage(getLang("moduleInfo", cmd.config.name, cmd.config.description.en, `${prefix}${cmd.config.name} ${(cmd.config.guide.en) ? cmd.config.guide.en : ""}`, cmd.config.category, cmd.config.countDown, ((cmd.config.role == 0) ? getLang("user") : (cmd.config.role == 1) ? getLang("adminGroup") : getLang("adminBot")), cmd.config.author), threadID, messageID);
  }
};
