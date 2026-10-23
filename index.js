import http from "http";
http.createServer((req,res)=>res.end("Bot online")).listen(process.env.PORT||3000);

import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth");
    const sock = makeWASocket({ auth: state, printQRInTerminal: false });
    sock.ev.on("creds.update", saveCreds);

    if(!sock.authState.creds.registered){
        const number = "31647317700";
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(number);
                console.log("========================");
                console.log("JOUW CODE: " + code);
                console.log("VUL IN OP JE TELEFOON NU!");
                console.log("========================");
            } catch(e) {
                console.log("Fout bij code aanvragen: ", e.message);
            }
        }, 3000);
    }

    sock.ev.on("connection.update", (u) => {
        if(u.connection === "open") console.log("ONLINE!!! It Oaljehok is gekoppeld!");
    });

    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if(!msg.message || msg.key.fromMe) return;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        if(text.toLowerCase() === "ping"){
            await sock.sendMessage(msg.key.remoteJid, {text: "Pong! It Oaljehok bot is online"});
        }
    });
}
startBot();
