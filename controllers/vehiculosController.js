import Vehiculo from '../models/Vehiculo.js';
import Cliente from '../models/Cliente.js';
import Turno from '../models/Turno.js';

// LISTAR VEHÍCULOS ACTIVOS
export const listarVehiculos = async (req, res, next) => {
    try {
        const vehiculos = await Vehiculo.find({ activo: true })
            .populate('clienteId', 'nombre apellido email')
            .sort({ createdAt: -1 });
        res.json(vehiculos);
    } catch (error) {
        next(error);
    }
};

// CONSULTAR VEHÍCULO POR ID
export const consultarVehiculoPorId = async (req, res, next) => {
    try {
        const vehiculo = await Vehiculo.findOne({ _id: req.params.id, activo: true })
            .populate('clienteId', 'nombre apellido telefono email');
        if (!vehiculo) {
            return res.status(404).json({ mensaje: 'Vehículo no encontrado o inactivo' });
        }
        res.json(vehiculo);
    } catch (error) {
        next(error);
    }
};

// AGREGAR VEHÍCULO
export const agregarVehiculo = async (req, res, next) => {
    try {
        const { patente, marca, modelo, clienteId } = req.body;
        // Comprobar que el cliente existe y está activo
        const clienteExiste = await Cliente.findOne({ _id: clienteId, activo: true });
        if (!clienteExiste) {
            return res.status(400).json({ mensaje: 'El cliente seleccionado no existe o está inactivo' });
        }
        const nuevoVehiculo = await Vehiculo.create({
            patente: patente?.trim().toUpperCase(),
            marca: marca?.trim(),
            modelo: modelo?.trim(),
            clienteId
        });
        res.status(201).json({
            mensaje: 'Vehículo creado con éxito',
            vehiculo: nuevoVehiculo
        });
    } catch (error) {
        next(error);
    }
};

// MODIFICAR VEHÍCULO
export const modificarVehiculoPorId = async (req, res, next) => {
    try {
        const { clienteId } = req.body;
        if (clienteId) {
            const clienteExiste = await Cliente.findOne({ _id: clienteId, activo: true });
            if (!clienteExiste) {
                return res.status(400).json({ mensaje: 'El cliente seleccionado no existe o está inactivo' });
            }
        }
        const vehiculoActualizado = await Vehiculo.findOneAndUpdate(
            { _id: req.params.id, activo: true },
            req.body,
            { new: true, runValidators: true }
        );
        if (!vehiculoActualizado) {
            return res.status(404).json({ mensaje: 'Vehículo no encontrado para modificar' });
        }
        res.json({
            mensaje: 'Vehículo modificado con éxito',
            vehiculo: vehiculoActualizado
        });
    } catch (error) {
        next(error);
    }
};

// ELIMINAR VEHÍCULO (BAJA LÓGICA)
export const eliminarVehiculoPorId = async (req, res, next) => {
    try {
        const vehiculo = await Vehiculo.findOne({ _id: req.params.id, activo: true });
        if (!vehiculo) {
            return res.status(404).json({ mensaje: 'Vehículo no encontrado' });
        }
        // Restricción: no dar de baja si tiene turnos activos
        const tieneTurnos = await Turno.findOne({ vehiculoId: req.params.id, activo: true });
        if (tieneTurnos) {
            return res.status(400).json({
                mensaje: 'No se puede eliminar el vehículo porque tiene turnos activos asociados'
            });
        }
        await Vehiculo.findByIdAndUpdate(req.params.id, { activo: false });
        res.json({ mensaje: 'Vehículo dado de baja correctamente' });
    } catch (error) {
        next(error);
    }
};