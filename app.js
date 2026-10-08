import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// ==========================================
// Módulos de Configuración y Middleware
// ==========================================
import conectarDB from './config/db.js';
import errorHandler from './middlewares/errorHandler.js';

// ==========================================
// Configuración de __dirname para ES Modules
// ==========================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conectar a MongoDB
conectarDB();

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// Motor de Plantillas (Pug) y Archivos Estáticos
// ==========================================
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

// ==========================================
// Middlewares de Parseo de Solicitudes
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// Integración de Módulos (API)
// ==========================================
// Módulo de Clientes - Implementado por Dalila
import clientesRutas from './routes/clientesRoutes.js';
app.use('/api/clientes', clientesRutas);

// Módulo de Vehículos - Implementado por Jorge
import vehiculosRutas from './routes/vehiculosRoutes.js';
app.use('/api/vehiculos', vehiculosRutas);

// Módulo de Turnos - Implementado por Luis
import turnosRutas from './routes/turnosRoutes.js';
app.use('/api/turnos', turnosRutas);

// Rutas Web (Pug)
import vistasRutas from './routes/vistas.js';
app.use("/", vistasRutas);

// ==========================================
// Ruta No Encontrada (404)
// ==========================================
app.use((req, res) => {
    res.status(404).render("404", { 
        titulo: "Página no encontrada",
        mensaje: "El recurso solicitado no existe" 
    });
});

// ==========================================
// Middleware Centralizado de Manejo de Errores
// ==========================================
app.use(errorHandler);

// ==========================================
// Inicialización del Servidor
// ==========================================
app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});