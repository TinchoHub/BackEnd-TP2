import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import contexto from "../prompts/asesor.js";

dotenv.config();

export const consultarIA = async (pregunta) => {
  // 1. Validar presencia de la API Key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("No se encontró GEMINI_API_KEY en las variables de entorno (.env)");
  }

  // 3. Inicializar el SDK de Gemini en cada solicitud
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-3.8-flash"
  });

  const prompt = `
${contexto}

Cliente:
${pregunta}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};