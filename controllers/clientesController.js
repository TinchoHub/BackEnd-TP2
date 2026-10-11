import Cliente from '../models/Cliente.js';
import Vehiculo from '../models/Vehiculo.js';

// LISTAR CLIENTES ACTIVOS
export const listarClientes = async (req, res, next) => {
    try {
        const clientes = await Cliente.find({ activo: true }).sort({ createdAt: -1 });
        res.json(clientes);
    } catch (error) {
        next(error);
    }
};

// CONSULTAR CLIENTE POR ID
export const consultarClientePorId = async (req, res, next) => {
    try {
        const cliente = await Cliente.findOne({ _id: req.params.id, activo: true });
        if (!cliente) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado o inactivo' });
        }
        res.json(cliente);
    } catch (error) {
        next(error);
    }
};

// AGREGAR CLIENTE
export const agregarCliente = async (req, res, next) => {
    try {
        const { nombre, apellido, telefono, email } = req.body;
        const nuevoCliente = await Cliente.create({
            nombre: nombre?.trim(),
            apellido: apellido?.trim(),
            telefono: String(telefono || '').trim(),
            email: email?.trim().toLowerCase()
        });
        res.status(201).json({
            mensaje: 'Cliente agregado con éxito',
            cliente: nuevoCliente
        });
    } catch (error) {
        next(error);
    }
};

// MODIFICAR CLIENTE
export const modificarClientePorId = async (req, res, next) => {
    try {
        const clienteActualizado = await Cliente.findOneAndUpdate(
            { _id: req.params.id, activo: true },
            req.body,
            { new: true, runValidators: true }
        );
        if (!clienteActualizado) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado o inactivo' });
        }
        res.json({
            mensaje: 'Cliente modificado con éxito',
            cliente: clienteActualizado
        });
    } catch (error) {
        next(error);
    }
};

// ELIMINAR CLIENTE (BAJA LÓGICA)
export const eliminarClientePorId = async (req, res, next) => {
    try {
        const cliente = await Cliente.findOne({ _id: req.params.id, activo: true });
        if (!cliente) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }
        // Integridad referencial: verificar si tiene vehículos activos asociados en MongoDB
        const tieneVehiculos = await Vehiculo.findOne({ clienteId: req.params.id, activo: true });
        if (tieneVehiculos) {
            return res.status(400).json({
                mensaje: 'No se puede eliminar el cliente porque tiene vehículos activos asociados'
            });
        }
        // Baja lógica
        await Cliente.findByIdAndUpdate(req.params.id, { activo: false });
        res.json({ mensaje: 'Cliente dado de baja correctamente' });
    } catch (error) {
        next(error);
    }
};