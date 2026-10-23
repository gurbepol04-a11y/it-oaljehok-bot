import http from "http";
http.createServer((req,res)=>res.end("It Oaljehok bot is online")).listen(process.env.PORT||3000);

import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth");
    const sock = makeWASocket({ auth: state, printQRInTerminal: false });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if(qr){
            console.log("SCAN DEZE QR IN WHATSAPP:");
            qrcode.generate(qr, {small: true});
        }
        if(connection === "close"){
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            if(shouldReconnect) startBot();
        } else if(connection === "open"){
            console.log("ONLINE: It Oaljehok bot is online!");
        }
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
