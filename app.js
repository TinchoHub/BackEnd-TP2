import 'dotenv/config';
import express from 'express';
import http from 'http';               // 1. Importar http nativo
import { Server } from 'socket.io';   // 2. Importar Socket.io
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import Usuario from './models/Usuario.js'
import iaRutas from './routes/iaRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';

import conectarDB from './config/db.js';
import errorHandler from './middlewares/errorHandler.js';
import { protegerApi } from './middlewares/authMiddleware.js';

import clientesRutas from './routes/clientesRoutes.js';
import vehiculosRutas from './routes/vehiculosRoutes.js';
import turnosRutas from './routes/turnosRoutes.js';
import vistasRutas from './routes/vistas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);  // 3. Crear el servidor HTTP con Express
// Vercel ejecuta funciones serverless, que no admiten conexiones WebSocket persistentes:
// en ese entorno las notificaciones en tiempo real quedan deshabilitadas.
const enVercel = Boolean(process.env.VERCEL);
const io = enVercel ? null : new Server(server);  // 4. Inicializar Socket.io sobre el servidor

const PORT = process.env.PORT || 3000;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Garantiza la conexión a MongoDB antes de atender cada request (se reutiliza si ya existe)
app.use(async (req, res, next) => {
    try {
        await conectarDB();
        next();
    } catch (error) {
        next(error);
    }
});

// 5. Inyectar 'io' en cada petición para poder emitir eventos desde los controladores
app.use((req, res, next) => {
    req.io = io;
    res.locals.socketsHabilitados = Boolean(io);
    next();
});

// Middleware global de usuario para Pug
app.use(async (req, res, next) => {
    const token = req.cookies?.token;
    res.locals.usuario = null;

    if (token) {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            const usuario = await Usuario.findById(payload.id).select('-password');
            if (usuario && usuario.activo) {
                req.usuario = usuario;
                res.locals.usuario = usuario;
            } else {
                res.clearCookie('token');
            }
        } catch (error) {
            res.clearCookie('token');
        }
    }
    next();
});

// Eventos básicos de conexión de WebSocket
io?.on('connection', (socket) => {
    console.log(`[WebSocket] Cliente conectado con ID: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`[WebSocket] Cliente desconectado: ${socket.id}`);
    });
});

// Chequeo de salud para la plataforma de despliegue (público)
app.get('/health', (req, res) => res.json({ estado: 'ok' }));

// Rutas
// La API REST exige sesión válida (JWT en cookie); /api/ia lo valida en su propio router
app.use('/api/clientes', protegerApi, clientesRutas);
app.use('/api/vehiculos', protegerApi, vehiculosRutas);
app.use('/api/turnos', protegerApi, turnosRutas);
app.use('/api/ia', iaRutas);
app.use('/usuarios', usuarioRoutes);
app.use('/', vistasRutas);


// 404 y Errores
app.use((req, res) => {
    res.status(404).render('404', { 
        titulo: 'Página no encontrada',
        mensaje: 'El recurso solicitado no existe' 
    });
});
app.use(errorHandler);

// Inicio local: en Vercel no se abre un puerto, la plataforma invoca la app exportada
const iniciarServidor = async () => {
    try {
        await conectarDB();
        server.listen(PORT, () => {
            console.log(`Servidor en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('No se pudo iniciar el servidor:', error.message);
        process.exit(1);
    }
};

if (!enVercel) iniciarServidor();

export default app;
