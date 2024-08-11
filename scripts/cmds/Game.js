module.exports = {
    config: {
        name: "تفكيك", // اسم الأمر
        version: "1.0.0", // إصدار الأمر
        author: "عبدالرحمن", // مؤلف الأمر
        countDown: 0, // الوقت المطلوب بين الأوامر (بالثواني)
        role: 0, // دور المستخدم لاستخدام هذا الأمر (0: مستخدم عادي، 1: مسؤول المحادثة، 2: مالك الروبوت)
        shortDescription: {
            ar: "لعبة تفكيك الكلمه",
            en: "Word Deconstruction Game"
        }, // وصف مختصر للأمر
        description: {
            ar: "لعبة تعتمد على سرعة تفكيك الكلمات المعطاة",
            en: "A game based on quickly deconstructing given words"
        }, // وصف طويل للأمر
        category: "العاب", // فئة الأمر
        guide: {
            ar: "اكتب الكلمة لتحاول تفكيكها",
            en: "Type the word to attempt deconstruction"
        } // دليل استخدام الأمر
    },

    langs: {
        ar: {
            congrats: "تهانينا %1 انت الاسرع وكسبت 50 دولار",
            tryAgain: "خطأ حاول مره اخرا",
            prompt: "اسرع شخص يفكك كلمه: %1"
        },
        en: {
            congrats: "Congratulations %1, you were the fastest and won $50",
            tryAgain: "Wrong, try again",
            prompt: "Be the fastest to deconstruct the word: %1"
        }
    },

    onStart: async function (context) {
        return this.run(context);
    },

    run: async function ({ api, event, args, getLang }) {
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        const correctAnswer = randomQuestion.answer;
        const question = randomQuestion.question;

        const message = getLang("prompt", question);

        api.sendMessage({ body: message }, event.threadID, (error, info) => {
            if (!error) {
                global.client.handleReply.push({
                    name: this.config.name,
                    messageID: info.messageID,
                    correctAnswer: correctAnswer
                });
            }
        });
    },

    handleReply: async function ({ api, event, handleReply, Currencies, getLang }) {
        const userAnswer = event.body.trim().toLowerCase();
        const correctAnswer = handleReply.correctAnswer.toLowerCase();
        const userName = global.data.userName.get(event.senderID) || await Users.getNameUser(event.senderID);

        if (userAnswer === correctAnswer) {
            Currencies.increaseMoney(event.senderID, 50);
            api.sendMessage(getLang("congrats", userName), event.threadID);
            api.unsendMessage(handleReply.messageID); 
        } else {
            api.sendMessage(getLang("tryAgain"), event.threadID);
        }
    }
};

const questions = [
    { question: "بيت", answer: "ب ي ت" },
    { question: "رجل", answer: "ر ج ل" },
    { question: "امرأة", answer: "ا م ر أ ة" },
    { question: "ولد", answer: "و ل د" },
    { question: "فتاة", answer: "ف ت ا ة" },
    { question: "ماء", answer: "م ا ء" },
    { question: "نار", answer: "ن ا ر" },
    { question: "شمس", answer: "ش م س" },
    { question: "قمر", answer: "ق م ر" },
    { question: "ليل", answer: "ل ي ل" },
    { question: "نهار", answer: "ن ه ا ر" },
    { question: "جبل", answer: "ج ب ل" },
    { question: "سهل", answer: "س ه ل" },
    { question: "شجرة", answer: "ش ج ر ة" },
    { question: "زهرة", answer: "ز ه ر ة" },
    { question: "طير", answer: "ط ي ر" },
    { question: "أسد", answer: "أ س د" },
    { question: "ذئب", answer: "ذ ئ ب" },
    { question: "جمل", answer: "ج م ل" },
    { question: "بقر", answer: "ب ق ر" },
    { question: "غنم", answer: "غ ن م" },
    { question: "كتاب", answer: "ك ت ا ب" },
    { question: "قلم", answer: "ق ل م" },
    { question: "ورقة", answer: "و ر ق ة" },
    { question: "منزل", answer: "م ن ز ل" },
    { question: "مدرسة", answer: "م د ر س ة" },
    { question: "مستشفى", answer: "م س ت ش ف ى" },
    { question: "متجر", answer: "م ت ج ر" },
    { question: "مطعم", answer: "م ط ع م" },
    { question: "سيارة", answer: "س ي أ ر ة" },
    { question: "دراجة", answer: "د ر ا ج ة" },
    { question: "طائرة", answer: "ط ا ئ ر ة" },
    { question: "قطار", answer: "ق ط ا ر" },
    { question: "سفينة", answer: "س ف ي ن ة" }
];
