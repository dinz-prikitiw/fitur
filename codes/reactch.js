import fetch from "node-fetch"

let handler = async (m, { conn, text, isOwner }) => {
    if (!isOwner) return m.reply('❌ Perintah ini hanya untuk Owner.')

    if (!text) {
        return m.reply(`📌 Contoh penggunaan:
.reactch2 https://whatsapp.com/channel/xxx/123 😂,🔥,❤️`)
    }

    // ==========================
    // Parsing input
    // ==========================
    let args = text.trim().split(" ")
    let link = args.shift()
    let emojiRaw = args.join(" ").trim()

    if (!link.includes("https://whatsapp.com/channel/"))
        return m.reply("⚠️ Link channel tidak valid!")

    if (!emojiRaw)
        return m.reply("⚠️ Masukkan emoji yang ingin digunakan!")

    const emoji = emojiRaw.replace(/\s*,\s*/g, ",")

    // ==========================
    // API URL FAA
    // ==========================
    const apiUrl = `https://api-faa.my.id/faa/react-channel?url=${encodeURIComponent(link)}&react=${encodeURIComponent(emoji)}`

    try {
        const res = await fetch(apiUrl)
        const json = await res.json()

        // Jika API gagal
        if (!json.status && !json.success) {
            return m.reply(`❌ API ERROR\n\n${JSON.stringify(json, null, 2)}`)
        }

        // ==========================
        // SUCCESS MESSAGE
        // ==========================
        m.reply(`✅ *Berhasil react!*
🎭 Emoji: ${emoji}
🔗 Channel: ${link}

✔️ *DONE reactch2!*`)

    } catch (err) {
        console.error(err)
        return m.reply("❌ Terjadi kesalahan saat menghubungi API.")
    }
}

handler.command = ['reactch2']
handler.owner = true
export default handler