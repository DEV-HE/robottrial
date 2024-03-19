// Importa la función downloadMediaMessage del paquete '@adiwajshing/baileys'
const { downloadMediaMessage } = require('@adiwajshing/baileys');
// Importa el módulo de sistema de archivos de Node.js en su versión de promesas
const fs = require('node:fs/promises');
// Importa la función convertOggMp3 desde el archivo de servicios local
const { convertOggMp3 } = require('./services/convert');
// Importa la función voiceToText desde el archivo de servicios local
const { voiceToText } = require('./services/whisper');

/**
 * Maneja la conversión de notas de voz a texto.
 * @async
 * @function handlerAI
 * @param {object} ctx - El contexto de la solicitud, que contiene los datos de la nota de voz.
 * @returns {Promise<string>} El texto transcrito de la nota de voz.
 * @description Esta función realiza los siguientes pasos:
 * 1. Descarga el mensaje de medios (nota de voz) como un buffer.
 * 2. Guarda el buffer en un archivo temporal con formato .ogg.
 * 3. Convierte el archivo .ogg a formato .mp3.
 * 4. Utiliza el servicio de voz a texto para convertir el contenido de audio en texto.
 */
const handlerAI = async (ctx) => {
  // Descarga el mensaje de medios como un buffer.
  const buffer = await downloadMediaMessage(ctx, "buffer");
  // Genera rutas de archivo temporales para .ogg y .mp3 basado en la hora actual.
  const pathTmpOgg = `${process.cwd()}/tmp/voice-note-${Date.now()}.ogg`;
  const pathTmpMp3 = `${process.cwd()}/tmp/voice-note-${Date.now()}.mp3`;
  // Guarda el buffer como un archivo .ogg en el sistema de archivos.
  await fs.writeFile(pathTmpOgg, buffer);
  // Convierte el archivo .ogg a .mp3.
  await convertOggMp3(pathTmpOgg, pathTmpMp3);
  // Convierte el contenido de audio del archivo .mp3 a texto.
  const text = await voiceToText(pathTmpMp3);
  // Retorna el texto transcrito.
  return text; // Retorna el texto transcrito de la nota de voz.
};

// Exporta la función handlerAI para su uso en otros módulos.
module.exports = { handlerAI };
