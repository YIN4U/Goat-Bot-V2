const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
 config: {
   name: "تطقيم",
   aliases: ["cdp"],
   version: "1.0",
   author: "milan-says",
   countDown: 5,
   role: 0,
   shortDescription: {
     en: "تطقيمات أنمي"
   },
   longDescription: {
     en: "تطقيمات أنمي"
   },
   category: "حب",
   guide: {
     en: "{pn}"
   }
 },

 onStart: async function ({ api, event, args }) {
   try {
     const { data } = await axios.get(
       "https://deku-rest-api.gleeze.com/cdp"
     );

     const maleImg = await axios.get(data.result.one, { responseType: "arraybuffer" });
     fs.writeFileSync(__dirname + "/tmp/img1.png", Buffer.from(maleImg.data, "utf-8"));

     const femaleImg = await axios.get(data.result.two, { responseType: "arraybuffer" });
     fs.writeFileSync(__dirname + "/tmp/img2.png", Buffer.from(femaleImg.data, "utf-8"));

     const msg = "⚜️|إليك التطقيمات الخاصة بك|⚜️";
     const allImages = [
       fs.createReadStream(__dirname + "/tmp/img1.png"),
       fs.createReadStream(__dirname + "/tmp/img2.png")
     ];

     return api.sendMessage({
       body: msg,
       attachment: allImages
     }, event.threadID, event.messageID);
   } catch (error) {
     console.error(error);
   }
 }
};
