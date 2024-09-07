const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "H.json");

module.exports = {
	config: {
		name: "كايتو",
		version: "1.1.1",
		author: "Yin",
		countDown: 2,
		role: 0,
		description: {
			en: "Start a conversation with Harley or make it leave the group",
			ar: "ابدأ محادثة مع هارلي أو اجعلها تغادر المجموعة"
		},
		category: "chatbots",
		guide: {
			en: "{pn} [command]",
			ar: "{pn} [أمر]"
		}
	},

	langs: {
		en: {
			successLeave: "- The bot has left the group",
			failedLeave: "- Failed to make the bot leave the group",
			chatEnabled: "- Chat mode is now enabled.",
			chatDisabled: "- Chat mode is now disabled.",
			addFunctionEnabled: "- Add function is now enabled.",
			addFunctionDisabled: "- Add function is now disabled.",
			deleteFunctionEnabled: "- Delete function is now enabled.",
			deleteFunctionDisabled: "- Delete function is now disabled.",
			successAdd: "- Successfully added \"{word}\" with response: \"{response}\".",
			failedAdd: "- The response \"{response}\" already exists for \"{word}\".",
			successDelete: "- Successfully deleted the response \"{response}\" for \"{word}\".",
			failedDelete: "- The response \"{response}\" does not exist for \"{word}\".",
			successDeleteAll: "- Successfully deleted all responses for \"{word}\".",
			notFound: "- \"{word}\" not found in responses.",
			invalidCommand: "- Invalid command. Please use 'leave', 'enable/disable', 'add', or 'delete'."
		},
		ar: {
			successLeave: "- البوت غادر المجموعة بنجاح",
			failedLeave: "- فشل البوت في مغادرة المجموعة",
			chatEnabled: "- تم تفعيل وضع المحادثة.",
			chatDisabled: "- تم إيقاف وضع المحادثة.",
			addFunctionEnabled: "- تم تفعيل وظيفة الإضافة.",
			addFunctionDisabled: "- تم إيقاف وظيفة الإضافة.",
			deleteFunctionEnabled: "- تم تفعيل وظيفة الحذف.",
			deleteFunctionDisabled: "- تم إيقاف وظيفة الحذف.",
			successAdd: "- تم إضافة \"{word}\" مع الرد: \"{response}\" بنجاح.",
			failedAdd: "- الرد \"{response}\" موجود بالفعل للكلمة \"{word}\".",
			successDelete: "- تم حذف الرد \"{response}\" من الكلمة \"{word}\" بنجاح.",
			failedDelete: "- الرد \"{response}\" غير موجود في الكلمة \"{word}\".",
			successDeleteAll: "- تم حذف جميع الردود للكلمة \"{word}\" بنجاح.",
			notFound: "- الكلمة \"{word}\" غير موجودة في الردود.",
			invalidCommand: "- أمر غير صالح. يرجى استخدام 'غادر'، 'تشغيل/إيقاف'، 'إضافة'، أو 'مسح'."
		}
	},

	onLoad: () => {
		if (!fs.existsSync(DATA_FILE)) {
			fs.writeFileSync(DATA_FILE, JSON.stringify({ responses: {} }, null, 4), "utf-8");
		}
	},

	onStart: () => {
		// تأكد من أن global.config موجود
		if (!global.config) {
			global.config = {};
		}

		// تعيين القيم للخصائص
		global.ENABLE_CHAT = true;
		global.config.ADD_FUNCTION = false;
		global.config.DEL_FUNCTION = false;
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

	run: async ({ event, api, args, permssion, getLang }) => {
		const { threadID, messageID } = event;
		const command = args[0]?.toLowerCase();
		const content = args.slice(1).join(" ").trim().toLowerCase();

		if (command === "غادر") {
			if (permssion === 0) {
				return api.sendMessage(getLang('invalidCommand'), threadID, messageID);
			}

			try {
				await api.removeUserFromGroup(api.getCurrentUserID(), threadID);
				return api.sendMessage(getLang('successLeave'), threadID, messageID);
			} catch (error) {
				console.error(error);
				return api.sendMessage(getLang('failedLeave'), threadID, messageID);
			}
		}

		if (command === "تشغيل" || command === "إيقاف") {
			if (permssion === 0) {
				return api.sendMessage(getLang('invalidCommand'), threadID, messageID);
			}

			global.ENABLE_CHAT = command === "تشغيل";
			return api.sendMessage(getLang(global.ENABLE_CHAT ? 'chatEnabled' : 'chatDisabled'), threadID, messageID);
		}

		if (command === "إضافة") {
			if (!global.config.ADD_FUNCTION) {
				return api.sendMessage(getLang('addFunctionDisabled'), threadID, messageID);
			}

			const [word, ...responseArray] = content.split("=>").map(item => item.trim());
			const response = responseArray.join("=>").trim();
			const lowercaseWord = word.toLowerCase();

			if (word && response) {
				const dataJson = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
				const responses = dataJson.responses || {};
				responses[lowercaseWord] = responses[lowercaseWord] || [];
				if (!responses[lowercaseWord].includes(response)) {
					responses[lowercaseWord].push(response);
					fs.writeFileSync(DATA_FILE, JSON.stringify(dataJson, null, 4), "utf-8");
					return api.sendMessage(getLang('successAdd', { word, response }), threadID, messageID);
				} else {
					return api.sendMessage(getLang('failedAdd', { word, response }), threadID, messageID);
				}
			}
		}

		if (command === "مسح") {
			if (!global.config.DEL_FUNCTION) {
				return api.sendMessage(getLang('deleteFunctionDisabled'), threadID, messageID);
			}

			const [word, response] = content.split("=!").map(item => item.trim());
			const lowercaseWord = word.toLowerCase();
			const dataJson = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
			const responses = dataJson.responses || {};

			if (responses[lowercaseWord]) {
				if (response) {
					const index = responses[lowercaseWord].indexOf(response);
					if (index !== -1) {
						responses[lowercaseWord].splice(index, 1);
						if (responses[lowercaseWord].length === 0) delete responses[lowercaseWord];
						fs.writeFileSync(DATA_FILE, JSON.stringify(dataJson, null, 4), "utf-8");
						return api.sendMessage(getLang('successDelete', { word, response }), threadID, messageID);
					} else {
						return api.sendMessage(getLang('failedDelete', { word, response }), threadID, messageID);
					}
				} else {
					delete responses[lowercaseWord];
					fs.writeFileSync(DATA_FILE, JSON.stringify(dataJson, null, 4), "utf-8");
					return api.sendMessage(getLang('successDeleteAll', { word }), threadID, messageID);
				}
			} else {
				return api.sendMessage(getLang('notFound', { word }), threadID, messageID);
			}
		}

		return api.sendMessage(getLang('invalidCommand'), threadID, messageID);
	}
};
