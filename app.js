import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';

// ==========================================
// Módulos de Configuración y Middleware
// ==========================================
import conectarDB from './config/db.js';
import errorHandler from './middlewares/errorHandler.js';

// ==========================================
// Importación de Rutas
// ==========================================
import clientesRutas from './routes/clientesRoutes.js';
import vehiculosRutas from './routes/vehiculosRoutes.js';
import turnosRutas from './routes/turnosRoutes.js';
import vistasRutas from './routes/vistas.js';

// ==========================================
// Configuración de __dirname para ES Modules
// ==========================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// Motor de Plantillas (Pug) y Archivos Estáticos
// ==========================================
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// Middlewares de Parseo de Solicitudes
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// Configuración de Sesiones
// ==========================================
app.use(session({
    secret: process.env.SESSION_SECRET || 'autobox-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // Sesión válida por 1 hora
}));

// Pasar el usuario a las vistas Pug de manera global
app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    next();
});

// ==========================================
// Integración de Rutas (API y Web)
// ==========================================
app.use('/api/clientes', clientesRutas);
app.use('/api/vehiculos', vehiculosRutas);
app.use('/api/turnos', turnosRutas);
app.use('/', vistasRutas);

// ==========================================
// Ruta No Encontrada (404)
// ==========================================
app.use((req, res) => {
    res.status(404).render('404', { 
        titulo: 'Página no encontrada',
        mensaje: 'El recurso solicitado no existe' 
    });
});

// ==========================================
// Middleware Centralizado de Manejo de Errores
// ==========================================
app.use(errorHandler);

// ==========================================
// Inicialización del Servidor
// ==========================================
const iniciarServidor = async () => {
    try {
        await conectarDB();

        app.listen(PORT, () => {
            console.log(`Servidor en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('No se pudo iniciar el servidor:', error.message);
        process.exit(1);
    }
};

iniciarServidor();