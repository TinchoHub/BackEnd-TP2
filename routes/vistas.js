import express from 'express';
import * as vistasController from '../controllers/vistasController.js';
import * as authController from '../controllers/authController.js';
import { protegerRuta } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ==========================================
// Rutas Públicas (Autenticación con MongoDB)
// ==========================================
router.get('/login', authController.renderLogin);
router.post('/login', authController.procesarLogin);
router.get('/logout', authController.procesarLogout);

// ==========================================
// Rutas Protegidas (Requieren Login)
// ==========================================

// Inicio
router.get('/', protegerRuta, vistasController.renderInicio);

// Clientes
router.get('/clientes', protegerRuta, vistasController.renderClientes);
router.get('/clientes/nuevo', protegerRuta, vistasController.renderNuevoCliente);
router.get('/clientes/:id/editar', protegerRuta, vistasController.renderEditarCliente);
router.post('/clientes/:id/editar', protegerRuta, vistasController.procesarModificarCliente);
router.get('/clientes/:id', protegerRuta, vistasController.renderClienteDetalle);
router.post('/clientes', protegerRuta, vistasController.procesarNuevoCliente);

// Vehículos
router.get('/vehiculos', protegerRuta, vistasController.renderVehiculos);
router.get('/vehiculos/nuevo', protegerRuta, vistasController.renderNuevoVehiculo);
router.get('/vehiculos/:id', protegerRuta, vistasController.renderVehiculoDetalle);
router.post('/vehiculos', protegerRuta, vistasController.procesarNuevoVehiculo);

// Turnos
router.get('/turnos', protegerRuta, vistasController.renderTurnos);
router.get('/turnos/nuevo', protegerRuta, vistasController.renderNuevoTurno);
router.get('/turnos/:id', protegerRuta, vistasController.renderTurnoDetalle);
router.post('/turnos', protegerRuta, vistasController.procesarNuevoTurno);

router.get('/asistente', protegerRuta, (req, res) => {
    res.render('asistente', {
        titulo: 'Asesor Técnico Inteligente'
    });
});

export default router;