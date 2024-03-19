/**
 * Clase para interactuar con la API de OpenAI.
 * Permite realizar diversas operaciones como enviar embeddings, chats y completions.
 */
class OpenAiClass {
    /**
     * Opciones por defecto para interactuar con la API de OpenAI.
     * @property {string} model - El modelo de IA a utilizar. Por defecto está vacío.
     * @property {number} temperature - La temperatura para la generación de respuestas. Por defecto es 0.
     * @property {string} apiKey - La clave de API necesaria para autenticar las solicitudes. Por defecto está vacía.
     */
    openAiOptions = { model: '', temperature: 0, apiKey: '' }

    /**
     * Constructor de la clase OpenAiClass.
     * @param {Object} _options - Opciones para configurar las solicitudes a la API de OpenAI.
     * @param {string} [_options.model='gpt-3.5-turbo-0301'] - El modelo de IA a utilizar.
     * @param {number} [_options.temperature=0] - La temperatura para la generación de respuestas.
     * @param {string} _options.apiKey - La clave de API necesaria para autenticar las solicitudes.
     */
    constructor(_options = { model: 'gpt-3.5-turbo-0301', temperature: 0, apiKey: '' }) {
        if (!_options?.apiKey) {
            throw new Error('apiKey no puede ser vacío')
        }

        this.openAiOptions = { ...this.openAiOptions, ..._options }
    }

    /**
     * Construye el encabezado para las solicitudes HTTP a la API de OpenAI.
     * @returns {Headers} Retorna un objeto Headers con los encabezados necesarios para las solicitudes.
     */
    buildHeader = () => {
        const headers = new Headers()
        headers.append('Content-Type', 'application/json')
        headers.append('Authorization', `Bearer ${this.openAiOptions.apiKey}`)
        return headers
    }

    /**
     * Envia una solicitud para obtener embeddings a partir de un texto.
     * @param {*} input - El texto de entrada para obtener el embedding.
     * @param {string} [model='text-embedding-ada-002'] - El modelo de embedding a utilizar.
     * @returns {Promise<Object>} Promesa que resuelve con la respuesta de la API de OpenAI.
     */
    sendEmbedding = async (input, model = 'text-embedding-ada-002') => {
        const headers = this.buildHeader()
        const raw = JSON.stringify({
            input,
            model,
        })

        const requestOptions = {
            method: 'POST',
            headers: headers,
            body: raw,
            redirect: 'follow',
        }

        const response = await fetch('https://api.openai.com/v1/embeddings', requestOptions)
        return response.json()
    }

    /**
     * Envía una solicitud de chat a la API de OpenAI.
     * @param {Array} [messages=[]] - El array de mensajes para enviar al chat.
     * @returns {Promise<Object>} Promesa que resuelve con la respuesta de la API de OpenAI.
     */
    sendChat = async (messages = []) => {
        const headers = this.buildHeader()

        const raw = JSON.stringify({
            model: this.openAiOptions.model,
            temperature: this.openAiOptions.temperature,
            messages,
        })

        const requestOptions = {
            method: 'POST',
            headers,
            body: raw,
            redirect: 'follow',
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', requestOptions)
        return response.json()
    }

    /**
     * Envia una solicitud de completions (completaciones) a la API de OpenAI.
     * @param {*} [prompt=undefined] - El prompt (indicación) para generar una completación.
     * @returns {Promise<Object>} Promesa que resuelve con la respuesta de la API de OpenAI.
     */
    sendCompletions = async (prompt = undefined) => {
        const headers = this.buildHeader()

        const raw = JSON.stringify({
            model: this.openAiOptions.model,
            temperature: this.openAiOptions.temperature,
            prompt
        })

        const requestOptions = {
            method: 'POST',
            headers,
            body: raw,
            redirect: 'follow',
        }

        const response = await fetch('https://api.openai.com/v1/completions', requestOptions)
        return response.json()
    }
}

module.exports = OpenAiClass
