// app.js valida el JWT en cada request y carga req.usuario (o lo deja sin definir).
// Estos middlewares solo consultan ese resultado: no repiten la consulta a MongoDB.

// Vistas web: sin sesión válida, redirige al login
const protegerRuta = (req, res, next) => {
  if (!req.usuario) return res.redirect("/login");
  next();
};

// API REST: sin sesión válida, responde 401 en JSON (no redirige)
const protegerApi = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({ mensaje: "Autenticación requerida" });
  }
  next();
};

// Restringe el acceso exclusivamente al rol 'admin'
const esAdmin = (req, res, next) => {
  if (!req.usuario) return res.redirect("/login");

  if (req.usuario.rol !== "admin") {
    return res.status(403).render("404", {
      titulo: "Acceso Denegado",
      mensaje: "No tenés permisos de administrador para gestionar usuarios."
    });
  }
  next();
};

export { protegerRuta, protegerApi, esAdmin };
