import Turno from '../models/Turno.js';
import Cliente from '../models/Cliente.js';
import Vehiculo from '../models/Vehiculo.js';

// LISTAR TURNOS ACTIVOS
export const listarTurnos = async (req, res, next) => {
    try {
        const turnos = await Turno.find({ activo: true })
            .populate('clienteId', 'nombre apellido')
            .populate('vehiculoId', 'patente marca modelo')
            .sort({ fecha: 1, hora: 1 });
        res.json(turnos);
    } catch (error) {
        next(error);
    }
};

// CONSULTAR TURNO POR ID
export const consultarTurnoPorId = async (req, res, next) => {
    try {
        const turno = await Turno.findOne({ _id: req.params.id, activo: true })
            .populate('clienteId', 'nombre apellido telefono email')
            .populate('vehiculoId', 'patente marca modelo');
        if (!turno) {
            return res.status(404).json({ mensaje: 'Turno no encontrado o cancelado' });
        }
        res.json(turno);
    } catch (error) {
        next(error);
    }
};

// CREAR TURNO
export const crearTurno = async (req, res, next) => {
    try {
        const { clienteId, vehiculoId, fecha, hora, servicio } = req.body;
        // Validar existencia de cliente activo
        const clienteExiste = await Cliente.findOne({ _id: clienteId, activo: true });
        if (!clienteExiste) {
            return res.status(400).json({ mensaje: 'El cliente seleccionado no existe o está inactivo' });
        }
        // Validar existencia de vehículo activo
        const vehiculo = await Vehiculo.findOne({ _id: vehiculoId, activo: true });
        if (!vehiculo) {
            return res.status(400).json({ mensaje: 'El vehículo seleccionado no existe o está inactivo' });
        }
        // Verificar que el vehículo pertenezca al cliente indicado
        if (vehiculo.clienteId.toString() !== clienteId.toString()) {
            return res.status(400).json({
                mensaje: 'El vehículo seleccionado no pertenece al cliente indicado'
            });
        }
        const nuevoTurno = await Turno.create({
            clienteId,
            vehiculoId,
            fecha,
            hora,
            servicio: servicio?.trim()
        });
        res.status(201).json({
            mensaje: 'Turno creado con éxito',
            turno: nuevoTurno
        });
    } catch (error) {
        next(error);
    }
};

// ACTUALIZAR TURNO
export const actualizarTurno = async (req, res, next) => {
    try {
        const { clienteId, vehiculoId } = req.body;
        if (clienteId && vehiculoId) {
            const vehiculo = await Vehiculo.findOne({ _id: vehiculoId, activo: true });
            if (!vehiculo || vehiculo.clienteId.toString() !== clienteId.toString()) {
                return res.status(400).json({
                    mensaje: 'El vehículo seleccionado no pertenece al cliente indicado'
                });
            }
        }
        const turnoActualizado = await Turno.findOneAndUpdate(
            { _id: req.params.id, activo: true },
            req.body,
            { new: true, runValidators: true }
        );
        if (!turnoActualizado) {
            return res.status(404).json({ mensaje: 'Turno no encontrado para actualizar' });
        }
        res.json({ mensaje: 'Turno actualizado con éxito', turno: turnoActualizado });
    } catch (error) {
        next(error);
    }
};

// CANCELAR TURNO (BAJA LÓGICA)
export const cancelarTurnoPorId = async (req, res, next) => {
    try {
        const turnoCancelado = await Turno.findOneAndUpdate(
            { _id: req.params.id, activo: true },
            { activo: false },
            { new: true }
        );
        if (!turnoCancelado) {
            return res.status(404).json({ mensaje: 'Turno no encontrado' });
        }
        res.json({ mensaje: 'Turno cancelado correctamente' });
    } catch (error) {
        next(error);
    }
};