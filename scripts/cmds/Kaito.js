const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "هارلي",
    version: "1.1.1",
    author: "Yin",
    countDown: 2,
    role: 0,
    description: {
      ar: "ابدأ محادثة مع هارلي",
      en: "Start a conversation with Harley"
    },
    category: "chatbots",
    guide: {
      ar: "   {pn} التحدث مع البوت"
    },
    usePrefix: true,
    usages: "التحدث مع البوت",
  },

  langs: {
    ar: {
      addFunctionEnabled: "تم تفعيل وظيفة الإضافة.",
      addFunctionDisabled: "تم تعطيل وظيفة الإضافة.",
      delFunctionEnabled: "تم تفعيل وظيفة الحذف.",
      delFunctionDisabled: "تم تعطيل وظيفة الحذف.",
      noPermission: "أنت غير مخول لاستخدام هذه الوظيفة!",
      enterMessage: "يرجى كتابة رسالة...",
      errorOccurred: "حدث خطأ أثناء معالجة الطلب.",
    }
  },

  onStart: function () {
    const DATA_FILE = path.join(__dirname, "H.json");
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify({ responses: {} }, null, 4), "utf-8");
    }
  },

  handleEvent: ({ event, api }) => {
    const { threadID, messageID, body } = event;
    if (!global.ENABLE_CHAT || !body) return;

    const content = body.toLowerCase();
    try {
      const dataJson = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      const responses = dataJson.responses || {};
      let respond = responses[content];

      if (Array.isArray(respond)) {
        respond = respond[Math.floor(Math.random() * respond.length)];
      }

      api.sendMessage(respond || "", threadID, messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage("حدث خطأ أثناء معالجة الطلب.", threadID, messageID);
    }
  },

  run: ({ event, api, args, permssion }) => {
    const { threadID, messageID } = event;
    const content = args.join(" ").trim().toLowerCase();

    if (args[0] === "تشغيل" || args[0] === "إيقاف") {
      if (permssion == 0) return api.sendMessage("أنت غير مخول لاستخدام هذه الوظيفة!", threadID, messageID);

      global.ENABLE_CHAT = args[0] === "تشغيل";
      return api.sendMessage(`تم ${global.ENABLE_CHAT ? "تفعيل" : "إيقاف"} وضع التحدث مع البوت.`, threadID, messageID);
    }

    if (!content) return api.sendMessage("يرجى كتابة رسالة...", threadID, messageID);

    try {
      const dataJson = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      const responses = dataJson.responses || {};
      let respond = "";

      if (content.startsWith("إضافة = ")) {
        if (permssion == 0) return api.sendMessage("أنت غير مخول لاستخدام وظيفة الإضافة!", threadID, messageID);

        const switchCase = content.substring(8).toLowerCase();
        global.config.ADD_FUNCTION = switchCase === "تشغيل";
        respond = `تم ${global.config.ADD_FUNCTION ? "تفعيل" : "تعطيل"} وظيفة الإضافة.`;
      } else if (content.startsWith("مسح = ")) {
        if (permssion == 0) return api.sendMessage("أنت غير مخول لاستخدام وظيفة الحذف.", threadID, messageID);

        const switchCase = content.substring(6).toLowerCase();
        global.config.DEL_FUNCTION = switchCase === "تشغيل";
        respond = `تم ${global.config.DEL_FUNCTION ? "تفعيل" : "تعطيل"} وظيفة الحذف.`;
      } else if (content.includes("=!")) {
        if (!global.config.DEL_FUNCTION) return api.sendMessage("وظيفة الحذف معطلة حاليًا.", threadID, messageID);

        const [word, response] = content.split("=!").map(item => item.trim());
        const lowercaseWord = word.toLowerCase();

        if (responses[lowercaseWord]) {
          if (response) {
            const index = responses[lowercaseWord].indexOf(response);
            if (index !== -1) {
              responses[lowercaseWord].splice(index, 1);
              if (responses[lowercaseWord].length === 0) delete responses[lowercaseWord];
              respond = `تم حذف الرد "${response}" من الكلمة "${word}" بنجاح.`;
            } else {
              respond = `الرد "${response}" غير موجود في الكلمة "${word}".`;
            }
          } else {
            delete responses[lowercaseWord];
            respond = `تم حذف جميع الردود للكلمة "${word}" بنجاح.`;
          }
        } else {
          respond = `الكلمة "${word}" غير موجودة في الردود.`;
        }
      } else if (content.includes("=>")) {
        if (!global.config.ADD_FUNCTION) return api.sendMessage("وظيفة الإضافة معطلة حاليًا.", threadID, messageID);

        const [word, ...responseArray] = content.split("=>").map(item => item.trim());
        const response = responseArray.join("=>").trim();
        const lowercaseWord = word.toLowerCase();

        if (word && response) {
          responses[lowercaseWord] = responses[lowercaseWord] || [];
          if (!responses[lowercaseWord].includes(response)) {
            responses[lowercaseWord].push(response);
            respond = `تمت إضافة "${word}" ككلمة جديدة مع الرد: "${response}".`;
          } else {
            respond = `الرد "${response}" موجود بالفعل للكلمة "${word}".`;
          }
        }
      } else {
        respond = responses[content];
        if (Array.isArray(respond)) {
          respond = respond[Math.floor(Math.random() * respond.length)];
        }
      }

      api.sendMessage(respond || "", threadID, messageID);

      dataJson.responses = responses;
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataJson, null, 4), "utf-8");
    } catch (error) {
      console.error(error);
      api.sendMessage("حدث خطأ أثناء معالجة الطلب.", threadID, messageID);
    }
  }
};
