// Importa la clase base OpenAiClass desde el archivo "openai.class".
const OpenAiClass = require("./openai.class");
// Importa la función "determineAgent" desde "../services/determine".
const { determineAgent } = require("../services/determine");
// Importa las funciones "buildPromptEmployee" y "finalPrompt" desde "./employee.rol".
const { buildPromptEmployee, finalPrompt } = require("./employee.rol");
// Importa la función "cleanText" desde "./util".
const { cleanText } = require("./util");

/**
 * Clase EmployeesClass extiende de OpenAiClass para manejar la información y lógica relacionada con los empleados.
 */
class EmployeesClass extends OpenAiClass {
  // Inicializa una lista vacía de empleados.
  listEmployees = [];

  /**
   * Constructor de la clase que inicializa la clase base OpenAiClass con los ajustes proporcionados.
   * @param {_settings} _settings Configuraciones para inicializar la clase base.
   */
  constructor(_settings) {
    super(_settings);
  }

  /**
   * Establece la lista de empleados.
   * @param {Array} employees Lista de empleados a establecer. Por defecto es un arreglo vacío.
   */
  employees = (employees = []) => {
    this.listEmployees = employees;
  };

  /**
   * Obtiene un agente (empleado) por nombre.
   * @param {string} employeeName El nombre del empleado a buscar.
   * @returns {Object} Retorna el empleado encontrado.
   */
  getAgent = (employeeName) => {
    const indexEmployee = this.listEmployees.findIndex(
      (emp) => emp.name === employeeName
    );
    return this.listEmployees[indexEmployee];
  };

  /**
   * Determina el empleado más adecuado basado en el texto de entrada.
   * @param {string} text Texto de entrada para determinar el empleado adecuado.
   * @returns {Promise<Object|string>} Retorna una promesa que resuelve al empleado más adecuado o un mensaje de error.
   */
  determine = async (text) => {
    try {
      const promptOutput = finalPrompt(
        text,
        buildPromptEmployee(this.listEmployees)
      );

      const llmDetermineEmployee = await this.sendChat([
        {
          role: "user",
          content: cleanText(promptOutput),
        },
      ]);

      if (llmDetermineEmployee?.error) {
        throw new Error(llmDetermineEmployee?.error?.message);
      }

      const bestChoice = determineAgent(
        llmDetermineEmployee.choices[0].message.content
      );
      const employee = this.getAgent(bestChoice.tool);
      return employee;

    } catch (err) {
      console.log(err);
      return `ERROR_DETERMINANDO_EMPLEADO: ${err.message}`;
    }
  };

  /**
   * Ejecuta el flujo de trabajo asociado a un empleado.
   * @param {Object} employee El empleado cuyo flujo de trabajo se va a ejecutar.
   * @param {Function} ctxFn Función de contexto que ejecuta el flujo de trabajo.
   */
  _gotoFlow = (employee, ctxFn) => {
    const flow = employee.flow;
    ctxFn.gotoFlow(flow);
  }
}

// Exporta la clase EmployeesClass para que pueda ser utilizada en otros módulos.
module.exports = EmployeesClass;
