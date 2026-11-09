import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

// Mostrar vista de Login
export const renderLogin = (req, res) => {
    if (req.cookies?.token) {
        try {
            jwt.verify(req.cookies.token, process.env.JWT_SECRET);
            return res.redirect('/');
        } catch (error) {
            res.clearCookie('token');
        }
    }
    res.render('login', { titulo: 'Iniciar Sesión' });
};

// Procesar Login y generar JWT en Cookie
export const procesarLogin = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).render('login', {
                titulo: 'Iniciar Sesión',
                error: 'Por favor, complete todos los campos'
            });
        }

        // Buscar usuario en MongoDB
        const usuario = await Usuario.findOne({ 
            username: username.trim().toLowerCase(), 
            activo: true 
        });

        if (!usuario) {
            return res.status(401).render('login', {
                titulo: 'Iniciar Sesión',
                error: 'Usuario o contraseña incorrectos'
            });
        }

        // Validar contraseña con bcrypt
        const esValida = await usuario.compararPassword(password);
        if (!esValida) {
            return res.status(401).render('login', {
                titulo: 'Iniciar Sesión',
                error: 'Usuario o contraseña incorrectos'
            });
        }

        // 1. Generar token JWT
        const token = jwt.sign(
            { id: usuario._id, username: usuario.username, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        // 2. Guardar el token en la cookie (reemplaza a req.session.usuario)
        res.cookie('token', token, {
            httpOnly: true, // Protege contra ataques XSS
            sameSite: 'lax', // Mitiga CSRF: la cookie no viaja en POST de otros sitios
            secure: process.env.NODE_ENV === 'production',
            maxAge: 2 * 60 * 60 * 1000 // 2 horas
        });

        res.redirect('/');
    } catch (error) {
        next(error);
    }
};

// Cerrar sesión (borra la cookie)
export const procesarLogout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
};