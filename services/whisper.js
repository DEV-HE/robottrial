const fs = require("fs");
const { Configuration, OpenAIApi } = require("openai");

/**
 * Convierte un archivo de audio en formato mp3 a texto utilizando la API de OpenAI.
 * @param {string} path La ruta del archivo mp3.
 * @returns {Promise<string>} El texto transcribido del archivo de audio.
 */
const voiceToText = async (path) => {
  // Verifica si el archivo existe en la ruta especificada.
  if (!fs.existsSync(path)) {
    throw new Error("No se encuentra el archivo");
  }

  try {
    // Configura la API de OpenAI con la clave de API proporcionada.
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    // Inicializa el cliente de la API de OpenAI.
    const openai = new OpenAIApi(configuration);
    // Solicita la transcripción del archivo de audio utilizando la API de OpenAI.
    const resp = await openai.createTranscription(
      fs.createReadStream(path),
      "whisper-1"
    );

    // Retorna el texto transcribido del archivo de audio.
    return resp.data.text;
  } catch (err) {
    // Maneja errores y retorna un mensaje de error genérico.
    console.log(err.response.data);
    return "ERROR";
  }
};

module.exports = { voiceToText };
