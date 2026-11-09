import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const consultarIA = async (pregunta) => {
  // 1. Validar presencia de la API Key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("No se encontró GEMINI_API_KEY en las variables de entorno (.env)");
  }

  // 2. Resolver la ruta absoluta al prompt
  const rutaPrompt = path.resolve(__dirname, "../prompts/asesor.txt");
  
  let contexto = "";
  try {
    contexto = await fs.readFile(rutaPrompt, "utf-8");
  } catch (fsErr) {
    throw new Error(`No se pudo leer el archivo de prompt en: ${rutaPrompt}. Asegurate de que la carpeta 'prompts' y el archivo 'asesor.txt' existan en la raíz.`);
  }

  // 3. Inicializar el SDK de Gemini en cada solicitud
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-3.8-flash"
  });

  const prompt = `
${contexto}

Cliente:
${pregunta}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};