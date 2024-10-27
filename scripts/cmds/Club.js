module.exports = {
  config: {
    name:"نادي",
    version: "1.0",
    author: "Loid Butter",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "قم بأضافة مستخدم إلى المجموعة",
    },
    longDescription: {
      en:"دخول نادي",
    },
    category: "المجموعة",
    guide: {
      en: "",
    },
  },

  // onStart is a function that will be executed when the command is executed
  onStart: async function ({ api, args, message, event }) {
    const supportGroupId = "7829326963776707"; // ID of the support group

    const threadID = event.threadID;
    const userID = event.senderID;

    // Check if the user is already in the support group
    const threadInfo = await api.getThreadInfo(supportGroupId);
    const participantIDs = threadInfo.participantIDs;
    if (participantIDs.includes(userID)) {
      // User is already in the support group
      api.sendMessage(
        "⚠️ | أنت بالفعل في مجموعة النادي. إذا لم تجده، يرجى التحقق من طلبات الرسائل أو قائمة الانتظار.",
        threadID
      );
    } else {
      // Add user to the support group
      api.setMessageReaction("🚫", event.messageID, (err) => {}, true);

      api.addUserToGroup(userID, supportGroupId, (err) => {
        if (err) {
          console.error("❌ | فشلت إضافة المستخدم إلى مجموعة النادي:", err);
          api.sendMessage("❌ | لا أستطيع إضافتك لأن هويتك غير مدعومة.", threadID);
        } else {
          api.setMessageReaction("✅", event.messageID, (err) => {}, true);

          api.sendMessage(
            "✅ | لقد تم إضافتك.",
            threadID
          );
        }
      });
    }
  },
};
