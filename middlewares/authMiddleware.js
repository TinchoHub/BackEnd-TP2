import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

const protegerRuta = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.redirect("/login");
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const usuario = await Usuario.findById(payload.id);

    if (!usuario || !usuario.activo) {
      res.clearCookie("token");
      return res.redirect("/login");
    }

    req.usuario = usuario;

    next();
  } catch (error) {
    res.clearCookie("token");
    return res.redirect("/login");
  }
};

export {
  protegerRuta
};