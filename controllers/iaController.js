import { consultarIA } from "../services/geminiServices.js";

export const responderConsultaIA = async (req, res, next) => {
  try {
    const { mensaje } = req.body;

    if (!mensaje || mensaje.trim().length === 0) {
      return res.status(400).json({ error: "Debe ingresar un mensaje o consulta." });
    }

    const respuesta = await consultarIA(mensaje);
    res.json({ respuesta });
  } catch (error) {
    next(error);
  }
};