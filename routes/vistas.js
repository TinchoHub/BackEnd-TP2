const express = require("express");
const router = express.Router();
const vistasController = require("../controllers/vistasController");

// Inicio
router.get("/", vistasController.renderInicio);

// Clientes
router.get("/clientes", vistasController.renderClientes);
router.get("/clientes/nuevo", vistasController.renderNuevoCliente);
router.get("/clientes/:id", vistasController.renderClienteDetalle);
router.post("/clientes", vistasController.procesarNuevoCliente);

// Vehículos
router.get("/vehiculos", vistasController.renderVehiculos);
router.get("/vehiculos/nuevo", vistasController.renderNuevoVehiculo);
router.get("/vehiculos/:id", vistasController.renderVehiculoDetalle);
router.post("/vehiculos", vistasController.procesarNuevoVehiculo);

// Turnos
router.get("/turnos", vistasController.renderTurnos);
router.get("/turnos/nuevo", vistasController.renderNuevoTurno);
router.get("/turnos/:id", vistasController.renderTurnoDetalle);
router.post("/turnos", vistasController.procesarNuevoTurno);

module.exports = router;