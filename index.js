import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

let voorraad = {};

client.on('qr', qr => {
    console.log('SCAN DEZE QR IN WHATSAPP:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('ONLINE: It oaljehok bot is online!');
});

client.on('message', async msg => {
    const text = msg.body.toLowerCase().trim();
    const chat = await msg.getChat();
    const sender = msg.author || msg.from;
    
    // Contact naam ophalen
    let name = 'onbekend';
    try {
        const contact = await msg.getContact();
        name = contact.pushname || contact.name || 'onbekend';
    } catch(e){}

    // EEN BIER
    if (text === 'een bier' || text === 'bier') {
        voorraad[name] = (voorraad[name] || 0) + 1;
        msg.reply(`🍺 1 biertje voor ${name}! Totaal: ${voorraad[name]}\nTyp "!voorraad" voor overzicht`);
    }
    // EEN BIER VOOR JAN
    else if (text.startsWith('een bier voor ')) {
        let voorWie = msg.body.substring(14).trim();
        voorraad[voorWie] = (voorraad[voorWie] || 0) + 1;
        msg.reply(`🍺 1 biertje voor ${voorWie}! (gezet door ${name})\nTotaal ${voorWie}: ${voorraad[voorWie]}`);
    }
    // VOORRAAD
    else if (text === '!voorraad' || text === 'voorraad') {
        if (Object.keys(voorraad).length === 0) {
            msg.reply('Nog geen biertjes genoteerd. Typ "een bier"');
        } else {
            let lijst = '📦 VOORRAAD IT OALJEHOK:\n';
            for (let p in voorraad) {
                lijst += `${p}: ${voorraad[p]} 🍺\n`;
            }
            msg.reply(lijst);
        }
    }
    // MIJN LIJST
    else if (text === 'mijn lijst' || text === '!mijnlijst') {
        msg.reply(`${name}: ${voorraad[name] || 0} biertjes`);
    }
    // HELP
    else if (text === '!help') {
        msg.reply(`COMMANDOS:\n- een bier\n- een bier voor [naam]\n- !voorraad\n- mijn lijst`);
    }
});

client.initialize();
