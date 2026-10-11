import express from 'express';
import * as vistasController from '../controllers/vistasController.js';
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

// Credenciales hardcodeadas de prueba
const USUARIO_ADMIN = {
    username: 'admin',
    password: 'password123',
    nombre: 'Administrador AutoBox'
};

// ==========================================
// Rutas Públicas (Autenticación)
// ==========================================

// Mostrar formulario de Login
router.get('/login', (req, res) => {
    if (req.session?.usuario) {
        return res.redirect('/');
    }
    res.render('login', { titulo: 'Iniciar Sesión' });
});

// Procesar Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === USUARIO_ADMIN.username && password === USUARIO_ADMIN.password) {
        req.session.usuario = {
            username: USUARIO_ADMIN.username,
            nombre: USUARIO_ADMIN.nombre
        };
        return res.redirect('/');
    }

    res.status(401).render('login', {
        titulo: 'Iniciar Sesión',
        error: 'Usuario o contraseña incorrectos'
    });
});

// Cerrar sesión
router.get('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        if (err) return next(err);
        res.redirect('/login');
    });
});

// ==========================================
// Rutas Protegidas (Requieren Login)
// ==========================================

// Inicio
router.get('/', isAuthenticated, vistasController.renderInicio);

// Clientes
router.get('/clientes', isAuthenticated, vistasController.renderClientes);
router.get('/clientes/nuevo', isAuthenticated, vistasController.renderNuevoCliente);
router.get('/clientes/:id/editar', isAuthenticated, vistasController.renderEditarCliente);
router.post('/clientes/:id/editar', isAuthenticated, vistasController.procesarModificarCliente);
router.get('/clientes/:id', isAuthenticated, vistasController.renderClienteDetalle);
router.post('/clientes', isAuthenticated, vistasController.procesarNuevoCliente);

// Vehículos
router.get('/vehiculos', isAuthenticated, vistasController.renderVehiculos);
router.get('/vehiculos/nuevo', isAuthenticated, vistasController.renderNuevoVehiculo);
router.get('/vehiculos/:id', isAuthenticated, vistasController.renderVehiculoDetalle);
router.post('/vehiculos', isAuthenticated, vistasController.procesarNuevoVehiculo);

// Turnos
router.get('/turnos', isAuthenticated, vistasController.renderTurnos);
router.get('/turnos/nuevo', isAuthenticated, vistasController.renderNuevoTurno);
router.get('/turnos/:id', isAuthenticated, vistasController.renderTurnoDetalle);
router.post('/turnos', isAuthenticated, vistasController.procesarNuevoTurno);

export default router;