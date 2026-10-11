export const isAuthenticated = (req, res, next) => {
    // Si la sesión existe y tiene el usuario, continúa
    if (req.session && req.session.usuario) {
        return next();
    }
    // Si no está autenticado, redirige al formulario de acceso
    res.redirect('/login');
};