/* 
   Sticker Maker Elara-MD (ESM)
   Fix By ChatGPT
*/

import fetch from "node-fetch";
import { Sticker } from "wa-sticker-formatter";
import { addExif } from "../lib/sticker.js";

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let stiker = false;

  try {
    let [packname, ...author] = (args.join(" ")).split("|");
    author = author.join("|") || global.author;
    packname = packname || global.packname;

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || q.mediaType || "";

    // STIKER WEBP
    if (/webp/.test(mime)) {
      let img = await q.download?.();
      stiker = await addExif(img, packname, author);
    }

    // GAMBAR → STIKER
    else if (/image/.test(mime)) {
      let img = await q.download?.();
      stiker = await createSticker(img, false, packname, author);
    }

    // VIDEO → STIKER GIF
    else if (/video/.test(mime)) {
      let video = await q.download?.();
      stiker = await mp4ToWebp(video, { pack: packname, author });
    }

    // URL
    else if (args[0] && isUrl(args[0])) {
      stiker = await createSticker(false, args[0], packname, author, 40);
    }

    else {
      throw `Reply foto/video/sticker dengan command *${usedPrefix + command}*`;
    }

  } catch (e) {
    console.log("Sticker Error:", e);
    stiker = String(e);
  }

  // SEND RESULT
  finally {
    if (Buffer.isBuffer(stiker)) {
      await conn.sendMessage(
        m.chat,
        { sticker: stiker },
        { quoted: m }
      );
    } else {
      await m.reply(stiker.toString());
    }
  }
};

handler.help = ["s", "sticker"];
handler.tags = ["sticker"];
handler.alias = ["sgif", "stikergif", "stickergif"];
handler.command = /^s(tic?ker)?(gif)?$/i;

handler.limit = true;
handler.register = true;

export default handler;

// =============================== //
// FUNCTION
// =============================== //

const isUrl = (url) => {
  return /https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=.]+/.test(url);
};

async function createSticker(img, url, packName, authorName, quality = 60) {
  let meta = {
    type: "full",
    pack: packName,
    author: authorName,
    quality,
  };
  return new Sticker(img ? img : url, meta).toBuffer();
}

async function mp4ToWebp(file, stickerMetadata = {}) {
  stickerMetadata.pack = stickerMetadata.pack || global.packname;
  stickerMetadata.author = stickerMetadata.author || global.author;
  stickerMetadata.crop = false;

  let base64 = file.toString("base64");

  const data = {
    file: `data:video/mp4;base64,${base64}`,
    processOptions: {
      crop: false,
      startTime: "00:00:00.0",
      endTime: "00:00:15.0",
      loop: 0,
    },
    stickerMetadata,
  };

  let res = await fetch(
    "https://sticker-api.openwa.dev/convertMp4BufferToWebpDataUrl",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  let result = await res.text();
  return Buffer.from(result.split(";base64,")[1], "base64");
}