module.exports = {
	config: {
		name: "يان",
		aliases: ["chat"],
		version: "1.0",
		author: "YourName",
		countDown: 2,
		role: 0,
		description: {
			en: "Enable or disable chat with the bot, and manage responses.",
			ar: "تشغيل أو إيقاف وضع التحدث مع البوت وإدارة الردود."
		},
		category: "chat",
		guide: {
			ar: "{pn} تشغيل: لتشغيل وضع التحدث مع البوت.\n{pn} إيقاف: لإيقاف الوضع.\n{pn} إضافة <كلمة> => <رد>: لإضافة رد جديد.\n{pn} مسح <كلمة> =! <رد>: لحذف رد موجود."
		}
	},

	langs: {
		ar: {
			enabled: "تم تفعيل وضع التحدث مع البوت.",
			disabled: "تم إيقاف وضع التحدث مع البوت.",
			onlyAdmin: "⚠️ | فقط المدراء يمكنهم استخدام هذا الأمر.",
			addedResponse: "✅ | تمت إضافة الرد الجديد بنجاح.",
			removedResponse: "✅ | تم حذف الرد بنجاح.",
			error: "❌ | حدث خطأ أثناء معالجة الأمر."
		}
	},

	onStart: async function ({ message, event, args, role, getLang }) {
		switch (args[0]) {
			case "تشغيل": {
				if (role < 1) return message.reply(getLang("onlyAdmin"));
				global.ENABLE_CHAT = true;
				return message.reply(getLang("enabled"));
			}
			case "إيقاف": {
				if (role < 1) return message.reply(getLang("onlyAdmin"));
				global.ENABLE_CHAT = false;
				return message.reply(getLang("disabled"));
			}
			case "إضافة": {
				if (role < 1) return message.reply(getLang("onlyAdmin"));
				const [word, response] = args.slice(1).join(" ").split("=>").map(item => item.trim());
				if (!word || !response) return message.reply("❌ | يرجى تقديم الكلمة والرد المناسب.");
				
				// إضافة الرد في JSON
				const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
				data.responses[word.toLowerCase()] = response;
				fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4), "utf-8");
				return message.reply(getLang("addedResponse"));
			}
			case "مسح": {
				if (role < 1) return message.reply(getLang("onlyAdmin"));
				const word = args.slice(1).join(" ").split("=!")[0].trim().toLowerCase();
				
				// حذف الرد من JSON
				const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
				delete data.responses[word];
				fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4), "utf-8");
				return message.reply(getLang("removedResponse"));
			}
		}
	},

	onChat: async function ({ message, event }) {
		if (!global.ENABLE_CHAT) return;
		const content = event.body.toLowerCase();

		// تحقق من الرد في JSON
		const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
		const response = data.responses[content];
		if (response) message.reply(response);
	}
};
