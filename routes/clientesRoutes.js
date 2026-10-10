import express from 'express';
import {
listarClientes,
agregarCliente,
consultarClientePorId,
modificarClientePorId,
eliminarClientePorId
} from '../controllers/clientesController.js';

const router = express.Router();

router.get('/', listarClientes);
router.post('/', agregarCliente);
router.get('/:id', consultarClientePorId);
router.put('/:id', modificarClientePorId);
router.delete('/:id', eliminarClientePorId);

export default router;
