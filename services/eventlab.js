const fs = require('node:fs');
const fetch = require('node-fetch'); // Asegúrate de tener 'node-fetch' para hacer peticiones HTTP.
const ffmpeg = require('fluent-ffmpeg'); // Asegúrate de haber instalado 'fluent-ffmpeg'.

/**
 *
 * @param {*} text Texto a convertir a voz
 * @param {*} voiceId ID de la voz para la síntesis
 * @returns Ruta del archivo MP4
 */
const textToVoice = async (text, voiceId = 'LlsiGQPTj7Tt7gsEPZl0') => {
  const EVENT_TOKEN = process.env.EVENT_TOKEN ?? "";
  const URL = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const header = new Headers();
  header.append("accept", "audio/mpeg");
  header.append("xi-api-key", EVENT_TOKEN);
  header.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    text,
    model_id: "eleven_multilingual_v1",
    voice_settings: {
      stability: 1,
      similarity_boost: 0.8,
    },
  });

  const requestOptions = {
    method: "POST",
    headers: header,
    body: raw,
    redirect: "follow",
  };

  const response = await fetch(URL, requestOptions);
  const buffer = await response.arrayBuffer();
  const mp3FilePath = `${process.cwd()}/tmp/${Date.now()}-audio.mp3`;
  fs.writeFileSync(mp3FilePath, Buffer.from(buffer));

  // Convertir MP3 a MP4 (solo audio)
  const mp4FilePath = `${process.cwd()}/tmp/${Date.now()}-audio.mp4`;
  await new Promise((resolve, reject) => {
    ffmpeg(mp3FilePath)
      .outputOptions('-vn') // Indica que no hay pista de video.
      .toFormat('mp4')
      .on('error', (err) => reject(err))
      .on('end', () => {
        resolve();
      })
      .save(mp4FilePath);
  });

  // Opcionalmente, puedes eliminar el archivo MP3 después de la conversión
  fs.unlinkSync(mp3FilePath);

  return mp4FilePath;
};

module.exports = { textToVoice };
