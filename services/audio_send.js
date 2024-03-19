// Importa la función `addKeyword` del módulo `@bot-whatsapp/bot`
// Esta función se utiliza para añadir nuevas palabras clave al bot de WhatsApp
const { addKeyword } = require('@bot-whatsapp/bot');

// Utiliza `module.exports` para exportar la configuración de una palabra clave específica
// En este caso, se añade la palabra clave 'tarjeta' para que el bot responda con una tarjeta de presentación
module.exports = addKeyword(['tarjeta'])
    // `addAnswer` configura la respuesta del bot para la palabra clave especificada
    // En este caso, la respuesta inicial es "Mi tarjeta de presentación". Los siguientes argumentos
    // se dejan como `null`, lo que indica que no hay modificaciones adicionales en esta parte de la configuración
    .addAnswer("Mi tarjeta de presentación", null, async (ctx, { provider }) => {
        // `ctx` contiene el contexto del mensaje recibido, incluyendo información como el ID del chat
        // `provider` es un objeto que permite interactuar con la API del servicio de mensajería

        // Extrae el ID del chat del contexto recibido
        const id = ctx.key.remoteJid;
        // Obtiene una instancia del socket (conexión) usando el `provider`
        // Esto es necesario para enviar mensajes a través del servicio de mensajería
        const sock = await provider.getInstance();
        // Envía un mensaje al chat identificado por `id`
        // El mensaje contiene una tarjeta de contacto con el nombre "HecBot" y los detalles del contacto especificados en `vcard`
        const sentMsg = await sock.sendMessage(id, {
            contacts: {
                displayName: "HecBot",
                contacts: [{ vcard }],
            },
        });
        // Nota: `vcard` debe estar definido en algún lugar del contexto o ser importado para que este código funcione correctamente
    });
