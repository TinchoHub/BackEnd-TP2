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

        // Poblar datos para emitir al WebSocket con información legible
        const turnoPoblado = await Turno.findById(nuevoTurno._id)
            .populate('clienteId', 'nombre apellido')
            .populate('vehiculoId', 'patente marca modelo');

        // Notificar en tiempo real a todos los clientes conectados
        if (req.io) {
            req.io.emit('turno:creado', {
                mensaje: 'Se ha agendado un nuevo turno',
                turno: turnoPoblado
            });
        }

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
        const turno = await Turno.findOne({ _id: req.params.id, activo: true });
        if (!turno) {
            return res.status(404).json({ mensaje: 'Turno no encontrado para actualizar' });
        }

        // Lista blanca: campos como 'activo' no se pueden modificar desde el body
        const camposPermitidos = ['clienteId', 'vehiculoId', 'fecha', 'hora', 'servicio'];
        for (const campo of camposPermitidos) {
            if (req.body[campo] !== undefined) turno[campo] = req.body[campo];
        }

        // Se valida sobre los valores finales, aunque llegue solo uno de los dos IDs
        const [cliente, vehiculo] = await Promise.all([
            Cliente.findOne({ _id: turno.clienteId, activo: true }),
            Vehiculo.findOne({ _id: turno.vehiculoId, activo: true })
        ]);
        if (!cliente || !vehiculo) {
            return res.status(400).json({ mensaje: 'El cliente o el vehículo no existe o está inactivo' });
        }
        if (vehiculo.clienteId.toString() !== turno.clienteId.toString()) {
            return res.status(400).json({
                mensaje: 'El vehículo seleccionado no pertenece al cliente indicado'
            });
        }

        await turno.save(); // ejecuta las validaciones del esquema
        res.json({ mensaje: 'Turno actualizado con éxito', turno });
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

        // Notificar en tiempo real la cancelación
        if (req.io) {
            req.io.emit('turno:cancelado', {
                id: req.params.id,
                mensaje: 'Un turno ha sido cancelado'
            });
        }

        res.json({ mensaje: 'Turno cancelado correctamente' });
    } catch (error) {
        next(error);
    }
};