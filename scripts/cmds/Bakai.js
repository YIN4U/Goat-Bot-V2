module.exports = {
  config: {
    name: "🦇",
    version: "1.0",
    author: "JRT/kira",
    countDown: 5,
    role: 2,
    shortDescription: "طرد جميع الأعضاء من المجموعة",
    longDescription: "",
    category: "المجموعة",
    usages: "[طرد الكل]",
  },
  onStart: async function({ api, event, getText, args }) {
    const { participantIDs } = await api.getThreadInfo(event.threadID);
    function delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    const botID = api.getCurrentUserID();
    const listUserID = participantIDs.filter(ID => ID != botID);
    return api.getThreadInfo(event.threadID, (err, info) => {
      if (err) return api.sendMessage("حدث خطأ!", event.threadID);
      if (!info.adminIDs.some(item => item.id == api.getCurrentUserID()))
        return api.sendMessage(`بحاجة إلى أن أكون مشرف في المجموعة\nالرجاء الإضافة والمحاولة مرة أخرى!`, event.threadID, event.messageID);
      if (info.adminIDs.some(item => item.id == event.senderID)) {
        setTimeout(function() { api.removeUserFromGroup(botID, event.threadID) }, 300000);
        return api.sendMessage(`بانكاي💥`, event.threadID, async (error, info) => {
          for (let id in listUserID) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            api.removeUserFromGroup(listUserID[id], event.threadID);
          }
        });
      } else return api.sendMessage('❗فقط مشرفين المجموعة بإمكانهم إستخدام هذا الأمر', event.threadID, event.messageID);
    });
  }
};
