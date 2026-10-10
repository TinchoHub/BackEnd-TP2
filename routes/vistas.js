
import express from 'express';
import * as vistasController from '../controllers/vistasController.js';

const router = express.Router();

// Inicio
router.get('/', vistasController.renderInicio);


 // Clientes
router.get('/clientes', vistasController.renderClientes);
router.get('/clientes/nuevo', vistasController.renderNuevoCliente);

// Rutas para modificar clientes
router.get('/clientes/:id/editar', vistasController.renderEditarCliente);
router.post('/clientes/:id/editar', vistasController.procesarModificarCliente);

router.get('/clientes/:id', vistasController.renderClienteDetalle);
router.post('/clientes', vistasController.procesarNuevoCliente);


// Vehículos
router.get('/vehiculos', vistasController.renderVehiculos);
router.get('/vehiculos/nuevo', vistasController.renderNuevoVehiculo);
router.get('/vehiculos/:id', vistasController.renderVehiculoDetalle);
router.post('/vehiculos', vistasController.procesarNuevoVehiculo);

// Turnos
router.get('/turnos', vistasController.renderTurnos);
router.get('/turnos/nuevo', vistasController.renderNuevoTurno);
router.get('/turnos/:id', vistasController.renderTurnoDetalle);
router.post('/turnos', vistasController.procesarNuevoTurno);

export default router;