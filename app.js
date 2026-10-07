const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// Módulo de Clientes - Implementado por Dalila
// ==========================================
const clientesRutas = require('./routes/clientesRoutes');
app.use('/api/clientes', clientesRutas);

// ==========================================
// Módulo de Vehículos - Implementado por Jorge
// ==========================================
const vehiculosRutas = require('./routes/vehiculosRoutes');
app.use('/api/vehiculos', vehiculosRutas);

// ==========================================
// Módulo de Turnos - Implementado por Luis
// ==========================================
const turnosRutas = require('./routes/turnosRoutes');
app.use('/api/turnos', turnosRutas);

// Rutas Web (Pug)
const vistasRutas = require("./routes/vistas");
app.use("/", vistasRutas);

// ==========================================
// RUTA NO ENCONTRADA (404)
// ==========================================
app.use((req, res) => {
    res.status(404).render("404", { 
        titulo: "Página no encontrada",
        mensaje: "El recurso solicitado no existe" 
    });
});

app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});