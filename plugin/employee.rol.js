// Importa constantes de configuración desde un archivo externo.
const PROMPTS = require("./prompt");

/**
 * Construye un mensaje (prompt) basado en un arreglo de empleados, asegurando que cada empleado tenga un nombre único y creando una descripción estructurada para cada uno.
 *
 * @param {Array} employees - Un arreglo de objetos que representan a los empleados. Cada objeto debe tener un `name` y una `description`. Es opcional y su valor por defecto es un arreglo vacío.
 * @returns {String} Una cadena de texto que representa el mensaje construido siguiendo las instrucciones de formato definidas en `PROMPTS.FORMAT_INSTRUCTIONS`.
 * @throws {Error} Lanza un error si el argumento `employees` no es un arreglo.
 * @throws {Error} Lanza un error si se encuentran nombres de empleados duplicados en el arreglo.
 */
const buildPromptEmployee = (employees = []) => {
  // Verifica que el parámetro `employees` sea un arreglo. Si no, lanza un error.
  if (!Array.isArray(employees)) {
    throw new Error("Debes ser un array de agentes");
  }

  // Reduce el arreglo `employees` para verificar la unicidad de los nombres. Si hay nombres duplicados, lanza un error.
  employees.reduce((pre, ccu) => {
    if (pre.includes(ccu.name)) {
      throw new Error(`Nombre de agente debe ser unico: ${ccu.name} repetido`);
    }
    return [...pre, ccu.name];
  }, []);

  // Crea un nuevo arreglo de objetos con la descripción de cada empleado.
  const agentsDescriptions = employees.map((agent) => ({
    [agent.name]: agent.description,
  }));

  // Construye el mensaje final reemplazando el marcador de posición en `FORMAT_INSTRUCTIONS` con las descripciones de los agentes y reemplazando los saltos de línea por espacios.
  const promptOutput = PROMPTS.FORMAT_INSTRUCTIONS.replace(
    "[{tool_names}]",
    JSON.stringify(agentsDescriptions)
  ).replaceAll("\n", " ");

  return promptOutput;
};


/**
 * Determina la herramienta y entrada de herramienta basado en una cadena de texto.
 * Extrae la acción y entrada de acción de un formato específico en el texto proporcionado.
 * 
 * @param {string} text - Cadena de texto que sigue un formato específico para ser analizado.
 * @returns {Object} Devuelve un objeto con `tool`, `toolInput` y `log` que contiene la herramienta, entrada de la herramienta y texto original, respectivamente.
 * @throws {Error} Lanza un error si no se puede analizar el texto proporcionado.
 */
const determineEmployee = (text) => {
  // Intenta extraer la acción y entrada de acción del texto.
  const match = /Action: ([\s\S]*?)(?:\nAction Input: ([\s\S]*?))?$/.exec(text);
  // Si no se encuentra un patrón válido, lanza un error.
  if (!match) {
    throw new Error(`No se pudo analizar la salida de LLM: ${text}`);
  }

  try {
    // Retorna la herramienta, entrada de herramienta y texto original limpiados de comillas innecesarias y espacios.
    return {
      tool: cleanText(match[1].trim()),
      toolInput: cleanText(
        match[2] ? match[2].trim().replace(/^("+)(.*?)(\1)$/, "$2") : ""
      ),
      log: cleanText(text),
    };
  } catch (e) {
    // En caso de error, devuelve un objeto indicando la falla.
    return {
      tool: null,
      toolInput: null,
      error: e.message,
    };
  }
};

/**
 * Construye un prompt final combinando un prefijo definido, instrucciones de parseo específicas y un sufijo que incluye el mensaje recibido.
 * Esta función es útil para preparar comandos o mensajes que serán procesados o interpretados por otro sistema o componente.
 * 
 * @param {*} message El mensaje que se incorporará al sufijo del prompt. Este parámetro puede ser de cualquier tipo,
 * pero generalmente se espera que sea una cadena de texto. La función lo insertará directamente en el sufijo,
 * reemplazando cualquier marcador de posición "{input}" presente en el sufijo predeterminado.
 * 
 * @param {*} parseInstructions Instrucciones específicas de parseo que se deben incluir entre el prefijo y el sufijo en el prompt final.
 * Este parámetro puede variar ampliamente en tipo y formato dependiendo de las necesidades del sistema receptor.
 * Su contenido se coloca directamente en el prompt sin ninguna modificación adicional.
 * 
 * @returns {string} Retorna el prompt final compuesto por el prefijo global, las instrucciones de parseo proporcionadas,
 * y el sufijo que ahora incluye el mensaje. Este prompt está listo para ser usado o enviado al sistema o componente correspondiente.
 */
const finalPrompt = (message, parseInstructions) => {
  // Sustituye el marcador de posición "{input}" en el sufijo global por el mensaje proporcionado.
  const parseSuffix = PROMPTS.SUFFIX.replace('{input}', message);
  // Construye el prompt final combinando el prefijo global, las instrucciones de parseo y el sufijo modificado.
  const PROMPT = `${PROMPTS.PREFIX} ${parseInstructions} ${parseSuffix}`;
  // Retorna el prompt final.
  return PROMPT;
}

// Exporta la función 'finalPrompt' junto con otras funciones 'determineEmployee' y 'buildPromptEmployee' para su uso en otros archivos.
module.exports = { determineEmployee, finalPrompt, buildPromptEmployee };
