const express = require('express');
const router = express.Router();
const {
    listarVehiculos,
    consultarVehiculoPorId,
    agregarVehiculo,
    modificarVehiculoPorId,
    eliminarVehiculoPorId
} = require('../controllers/vehiculosController');

// Definir las rutas para Vehículos
router.get('/', listarVehiculos);               // GET /vehiculos
router.get('/:id', consultarVehiculoPorId);     // GET /vehiculos/:id
router.post('/', agregarVehiculo);              // POST /vehiculos
router.put('/:id', modificarVehiculoPorId);     // PUT /vehiculos/:id
router.delete('/:id', eliminarVehiculoPorId);   // DELETE /vehiculos/:id

module.exports = router;