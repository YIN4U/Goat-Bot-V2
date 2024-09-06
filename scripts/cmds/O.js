module.exports = {
	config: {
		name: "out",
		version: "1.0.0",
		author: "Purv",
		countDown: 10,
		role: 2,
		description: {
			en: "Remove user from the group",
			ar: "إزالة المستخدم من المجموعة"
		},
		category: "Admin",
		guide: {
			en: "{pn} [id]",
			ar: "{pn} [معرف]"
		}
	},

	langs: {
		en: {
			successRemove: "- Successfully removed the user from the group",
			noUserId: "No user ID provided",
			failedRemove: "- Failed to remove the user from the group"
		},
		ar: {
			successRemove: "- تم إزالة المستخدم من المجموعة بنجاح",
			noUserId: "لم يتم توفير معرف المستخدم",
			failedRemove: "- فشل في إزالة المستخدم من المجموعة"
		}
	},

	onStart: async function ({ api, event, args, getLang }) {
		if (!args[0]) {
			return api.sendMessage(getLang('noUserId'), event.threadID);
		}
		
		const userID = args.join(" ");
		try {
			await api.removeUserFromGroup(api.getCurrentUserID(), userID);
			await api.sendMessage(getLang('successRemove'), event.threadID);
		} catch (err) {
			await api.sendMessage(getLang('failedRemove'), event.threadID);
		}
	}
};
