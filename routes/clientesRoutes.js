const express = require('express');

const router = express.Router();

const clientesController = require('../controllers/clientesController');


// Listar todos los clientes
router.get('/', clientesController.listarClientes);

// Agregar un cliente nuevo
router.post('/',  clientesController.agregarCliente);

// Consultar un cliente por ID
router.get('/:id', clientesController.consultarClientePorId);

// Modificar un cliente por ID
router.put('/:id', clientesController.modificarClientePorId);

// Eliminar un cliente por ID
router.delete('/:id', clientesController.eliminarClientePorId);

module.exports = router;