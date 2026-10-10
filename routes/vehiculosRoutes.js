
import express from 'express';
import * as vehiculosController from '../controllers/vehiculosController.js';

const router = express.Router();

// Definir las rutas para Vehículos
router.get('/', vehiculosController.listarVehiculos);
router.get('/:id', vehiculosController.consultarVehiculoPorId);
router.post('/', vehiculosController.agregarVehiculo);
router.put('/:id', vehiculosController.modificarVehiculoPorId);
router.delete('/:id', vehiculosController.eliminarVehiculoPorId);

export default router;