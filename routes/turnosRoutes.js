const express = require('express');
const router = express.Router();
const turnosController = require('../controllers/turnosController');

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


module.exports = router;