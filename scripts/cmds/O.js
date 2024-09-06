module.exports = {
	config: {
		name: "out",
		version: "1.0.0",
		author: "Purv",
		countDown: 10,
		role: 2,
		description: {
			en: "Bot leaves the group",
			ar: "البوت يغادر المجموعة"
		},
		category: "Admin",
		guide: {
			en: "{pn}",
			ar: "{pn}"
		}
	},

	langs: {
		en: {
			successLeave: "- The bot has left the group",
			failedLeave: "- Failed to make the bot leave the group"
		},
		ar: {
			successLeave: "- البوت غادر المجموعة بنجاح",
			failedLeave: "- فشل البوت في مغادرة المجموعة"
		}
	},

	onStart: async function ({ api, event, getLang }) {
		try {
			await api.removeUserFromGroup(api.getCurrentUserID(), event.threadID);
			await api.sendMessage(getLang('successLeave'), event.threadID);
		} catch (err) {
			await api.sendMessage(getLang('failedLeave'), event.threadID);
		}
	}
};
