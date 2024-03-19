// Requiere los módulos necesarios para el funcionamiento del script.
const fs = require('node:fs'); // Módulo de sistema de archivos para operaciones de archivos.
const fetch = require('node-fetch'); // Módulo para realizar peticiones HTTP.
const ffmpeg = require('fluent-ffmpeg'); // Módulo para manipular archivos multimedia, como convertir formatos.

/**
 * Convierte texto en voz utilizando la API de ElevenLabs y luego convierte el audio MP3 a MP4.
 *
 * @param {string} text Texto que se desea convertir en voz.
 * @param {string} [voiceId='U3nbunY0iWT9Vu9nsbab'] ID de la voz seleccionada para la síntesis de voz. Por defecto se usa una voz predeterminada.
 * @returns {Promise<string>} Una promesa que resuelve la ruta del archivo MP4 generado.
 * @async Indica que la función es asíncrona y devuelve una promesa.
 * 
 * La función realiza los siguientes pasos:
 * 1. Configura y realiza una petición POST a la API de ElevenLabs para convertir el texto en audio MP3.
 * 2. Recibe y guarda el audio MP3 en el sistema de archivos.
 * 3. Convierte el archivo MP3 a MP4 usando ffmpeg, indicando que el MP4 no contiene pista de video.
 * 4. Elimina el archivo MP3 original después de la conversión.
 * 5. Devuelve la ruta del archivo MP4 generado.
 */
const textToVoice = async (text, voiceId = 'U3nbunY0iWT9Vu9nsbab') => {
  // Token de autenticación para la API, obtenido de las variables de entorno.
  const EVENT_TOKEN = process.env.EVENT_TOKEN ?? "";
  // URL base de la API de ElevenLabs para la conversión de texto a voz.
  const URL = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  // Configuración de los encabezados de la petición HTTP.
  const header = new Headers();
  header.append("accept", "audio/mpeg");
  header.append("xi-api-key", EVENT_TOKEN);
  header.append("Content-Type", "application/json");

  // Cuerpo de la petición, incluyendo el texto y configuración de la voz.
  const raw = JSON.stringify({
    text,
    model_id: "eleven_multilingual_v1",
    voice_settings: {
      stability: 1,
      similarity_boost: 0.8,
    },
  });

  // Opciones de la petición HTTP, incluyendo método, encabezados y cuerpo.
  const requestOptions = {
    method: "POST",
    headers: header,
    body: raw,
    redirect: "follow",
  };

  // Realiza la petición HTTP y espera la respuesta.
  const response = await fetch(URL, requestOptions);
  // Convierte la respuesta a un ArrayBuffer.
  const buffer = await response.arrayBuffer();
  // Ruta y nombre del archivo MP3 temporal.
  const mp3FilePath = `${process.cwd()}/tmp/${Date.now()}-audio.mp3`;
  // Guarda el archivo MP3 en el sistema de archivos.
  fs.writeFileSync(mp3FilePath, Buffer.from(buffer));

  // Ruta y nombre del archivo MP4 resultante.
  const mp4FilePath = `${process.cwd()}/tmp/${Date.now()}-audio.mp4`;
  // Convierte el archivo MP3 a MP4.
  await new Promise((resolve, reject) => {
    ffmpeg(mp3FilePath)
      .outputOptions('-vn') // Opción para indicar que el archivo resultante no tiene pista de video.
      .toFormat('mp4') // Formato del archivo resultante.
      .on('error', (err) => reject(err)) // Maneja errores durante la conversión.
      .on('end', () => { // Función a ejecutar al finalizar la conversión.
        resolve();
      })
      .save(mp4FilePath); // Inicia la conversión y guarda el archivo.
  });

  // Opcionalmente, puedes eliminar el archivo MP3 después de la conversión
  fs.unlinkSync(mp3FilePath);

  return mp4FilePath;
};

module.exports = { textToVoice };
