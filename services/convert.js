// Requiere el módulo de la ruta de instalación de FFmpeg proporcionado por @ffmpeg-installer/ffmpeg
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
// Requiere el módulo fluent-ffmpeg para facilitar la interacción con FFmpeg
const ffmpeg = require("fluent-ffmpeg");
// Establece la ruta de FFmpeg para que fluent-ffmpeg la utilice
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Convierte un archivo de audio desde el formato OGG a MP3.
 * 
 * Esta función toma un flujo de entrada y un flujo de salida, realizando la conversión
 * del archivo de audio del formato original (OGG) al formato objetivo (MP3). La calidad
 * del audio en el archivo resultante se establece en 96 kbps. La función devuelve una promesa
 * que se resuelve a `true` una vez que la conversión ha finalizado exitosamente.
 *
 * @param {*} inputStream El flujo de entrada que contiene el archivo OGG a convertir.
 * @param {*} outStream El flujo de salida donde se guardará el archivo MP3 resultante.
 * @returns {Promise<boolean>} Una promesa que se resuelve a `true` una vez que la conversión ha finalizado.
 */
const convertOggMp3 = async (inputStream, outStream) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputStream) // Inicializa FFmpeg con el flujo de entrada
      .audioQuality(96) // Establece la calidad del audio en el archivo MP3 resultante a 96 kbps
      .toFormat("mp3") // Especifica que el formato de salida debe ser MP3
      .save(outStream) // Indica el flujo de salida donde se guardará el archivo MP3
      .on("progress", (p) => null) // Manejador de evento para el progreso de la conversión, actualmente no realiza ninguna operación
      .on("end", () => {
        resolve(true); // Resuelve la promesa a `true` cuando la conversión finaliza
      })
      .on("error", (err) => reject(err)); // Agrega manejo de errores rechazando la promesa en caso de un error
  });
};

// Exporta la función convertOggMp3 para que pueda ser utilizada por otros módulos
module.exports = { convertOggMp3 };
