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

// Middleware para restringir acceso exclusivamente a rol 'admin'
const esAdmin = async (req, res, next) => {
  // 1. Si no pasó por protegerRuta antes, verificamos si existe req.usuario
  if (!req.usuario) {
    return protegerRuta(req, res, () => esAdmin(req, res, next));
  }

  // 2. Comprobar si el rol es 'admin'
  if (req.usuario.rol !== "admin") {
    return res.status(403).render("404", {
      titulo: "Acceso Denegado",
      mensaje: "No tenés permisos de administrador para gestionar usuarios."
    });
  }

  next();
};

export {
  protegerRuta,
  esAdmin
};