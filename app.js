require("dotenv").config();

const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  EVENTS,
} = require("@bot-whatsapp/bot");
const QRPortalWeb = require("@bot-whatsapp/portal");
const { init } = require("bot-ws-plugin-openai");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require("@bot-whatsapp/database/mock");
const { handlerAI } = require("./utils");
const { textToVoice } = require("./services/eventlab");
// const sendAudio = require("./services/sendAudio");

const employeesAddonConfig = {
  model: "gpt-3.5-turbo-0301",
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
};

const employeesAddon = init(employeesAddonConfig);


const flowStaff = addKeyword(EVENTS.ACTION).addAnswer(
  ["Claro que te interesa?", "mejor te envio audio.."],
  null,
  async (ctx, { flowDynamic, state, provider }) => {
    console.log("🙉 texto a voz....");
    try {
      const currentState = state.getMyState();
      const path = await textToVoice(currentState.answer);
      console.log(`🙉 Fin texto a voz....[PATH]:${path}`);
      // await flowDynamic({ body: "escucha", media: path });

      const id = ctx.key.remoteJid
      const sock = await provider.getInstance()
      await sock.sendMessage(
        id, 
        { audio: { url: path} },
        // { url: path }, // can send mp3, mp4, & ogg
      )

    } catch (error) {
      if (error) {
        console.error("Error en flowStaff:", error);
      } else {
        console.error("Error en flowStaff: El error es undefined, revisa la función textToVoice.");
      }
    }
  }
);






const flowVoiceNote = addKeyword(EVENTS.VOICE_NOTE).addAction(
  async (ctx, ctxFn) => {
    try {
      await ctxFn.flowDynamic("dame un momento para escucharte...🙉");
      console.log("🤖 voz a texto....");
      const text = await handlerAI(ctx);
      console.log(`🤖 Fin voz a voz a texto....[TEXT]: ${text}`);
      const currentState = ctxFn.state.getMyState();
      const fullSentence = `${currentState?.answer ?? ""}. ${text}`;
      const { employee, answer } = await employeesAddon.determine(fullSentence);
      ctxFn.state.update({ answer });
      employeesAddon.gotoFlow(employee, ctxFn);
    } catch (error) {
      console.error("Error en flowVoiceNote:", error);
    }
  }
);


const main = async () => {
  const adapterDB = new MockAdapter();

  const adapterFlow = createFlow([flowVoiceNote, flowStaff]);

  const adapterProvider = createProvider(BaileysProvider);

  /**
   * 🤔 Empledos digitales
   * Imaginar cada empleado descrito con sus deberes de manera explicita
   */
  const employees = [
    {
      name: "NOT_EMPLOYEE",
      description:
        "Soy Jorge el staff amable encargado de atentender las solicitudes de los viajeros si tienen dudas, preguntas sobre el tour o la ciudad de madrid, mis respuestas son breves.",
      flow: flowStaff,
    }
  ];

  employeesAddon.employees(employees);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  QRPortalWeb()
  
};

main();
