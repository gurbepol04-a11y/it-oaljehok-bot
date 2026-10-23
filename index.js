import http from "http";
http.createServer((req,res)=>res.end("It Oaljehok bot is online")).listen(process.env.PORT||3000);

import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth");
    const sock = makeWASocket({ auth: state, printQRInTerminal: false });

    sock.ev.on("creds.update", saveCreds);

    if(!sock.authState.creds.registered){
        const phoneNumber = "31647317700"; // <--- HIER JOUW NUMMER INVULLEN
        setTimeout(async () => {
            let code = await sock.requestPairingCode(phoneNumber);
            console.log("JOUW KOPPELCODE: " + code);
            console.log("Ga in WhatsApp naar: Instellingen > Gekoppelde apparaten > Koppelen met telefoonnummer > Vul code in: " + code);
        }, 3000);
    }

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if(connection === "close"){
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
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
