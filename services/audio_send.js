const { addKeyword} = require('@bot-whatsapp/bot')


module.exports = addKeyword(['tarjeta']).addAnswer("Mi tarjeta de presentación", null, async (ctx, { provider }) => {
    
    

    const id = ctx.key.remoteJid
    const sock = await provider.getInstance()
    const sentMsg = await sock.sendMessage(id, {
        contacts: {
            displayName: "HecBot",
            contacts: [{ vcard }],
        },
    });
})

