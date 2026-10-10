import express from 'express';
import * as turnosController from '../controllers/turnosController.js';

const router = express.Router();

// Listar todos los turnos
router.get('/', turnosController.listarTurnos);

// Crear un turno nuevo
router.post('/', turnosController.crearTurno);

// Consultar un turno por ID
router.get('/:id', turnosController.consultarTurnoPorId);

// Cancelar/Eliminar un turno por ID
router.delete('/:id', turnosController.cancelarTurnoPorId);

// Modificar o actualizar un turno por ID
router.put('/:id', turnosController.actualizarTurno);

export default router;
