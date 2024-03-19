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
        { audio: { url: path}, mimetype: 'audio/mp4'},
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
      console.log("QUIERO VER QUÉ ES CTX",ctx,"FIN DE CTX")
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
      name: "SOY HÉCTOR Y TE PUEDO AYUDAR CON TUS FINANZAS",
      description:
        "Soy un representante de VOZ FINANZAS, una empresa que brinda soluciones integrales de alto valor para el crecimiento y gestión eficiente de tu negocio. Ofrecemos servicios avanzados de contabilidad y facturación, gestión de trámites para el registro de marcas y constitución de sociedades, así como evaluaciones exhaustivas de archivos y asesoramiento contable personalizado. Nuestro enfoque está en optimizar tu operación comercial, asegurando que cada aspecto de tu gestión financiera sea impecable. Además, te brindamos herramientas para la toma de decisiones estratégicas, apoyo en la planificación fiscal y estrategias para mejorar la eficiencia operativa. Nuestro equipo de expertos está comprometido con ofrecer soluciones a medida que se adaptan a las necesidades únicas de tu empresa, garantizando no solo el cumplimiento de las obligaciones legales y fiscales sino también impulsando el crecimiento sostenible de tu negocio. Con VOZ FINANZAS, obtienes un aliado estratégico que utiliza la última tecnología y las mejores prácticas del sector para darte una ventaja competitiva en el mercado. Estamos aquí para resolver cualquier duda y ayudarte a navegar los desafíos de tu empresa con confianza y éxito.",
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
