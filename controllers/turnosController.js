import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Turno from '../models/Turno.js';
import Cliente from '../models/Cliente.js';
import { leerVehiculos } from './vehiculosController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// LISTAR TURNOS
export const listarTurnos = async (req, res, next) => {
    try {
        const turnos = await Turno.find().sort({ id: 1 });
        res.json(turnos);
    } catch (error) {
        next(error);
    }
};

// CONSULTAR TURNO POR ID
export const consultarTurnoPorId = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                mensaje: 'El ID del turno debe ser un número entero válido'
            });
        }

        const turno = await Turno.findOne({ id });

        if (!turno) {
            return res.status(404).json({ mensaje: 'Turno no encontrado' });
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

        if (
            clienteId === undefined || clienteId === '' ||
            vehiculoId === undefined || vehiculoId === '' ||
            !fecha || !hora ||
            typeof servicio !== 'string' || !servicio.trim()
        ) {
            return res.status(400).json({
                mensaje: 'Faltan datos obligatorios (clienteId, vehiculoId, fecha, hora, servicio)'
            });
        }

        const clienteIdNumero = Number(clienteId);
        const vehiculoIdNumero = Number(vehiculoId);

        if (
            !Number.isInteger(clienteIdNumero) || clienteIdNumero < 1 ||
            !Number.isInteger(vehiculoIdNumero) || vehiculoIdNumero < 1
        ) {
            return res.status(400).json({
                mensaje: 'Los identificadores del cliente y vehículo deben ser números válidos'
            });
        }

        const clienteExiste = await Cliente.findOne({ id: clienteIdNumero });

        if (!clienteExiste) {
            return res.status(400).json({
                mensaje: 'El cliente seleccionado no existe'
            });
        }

        const vehiculos = leerVehiculos();
        const vehiculo = vehiculos.find(v => v.id === vehiculoIdNumero);

        if (!vehiculo) {
            return res.status(400).json({
                mensaje: 'El vehículo seleccionado no existe'
            });
        }

        if (Number(vehiculo.clienteId) !== clienteIdNumero) {
            return res.status(400).json({
                mensaje: 'El vehículo seleccionado no pertenece al cliente indicado'
            });
        }

        if (servicio.trim().length < 3) {
            return res.status(400).json({
                mensaje: 'El servicio debe tener al menos 3 caracteres'
            });
        }

        // Obtener el ID autoincremental secuencial basado en Mongoose
        const ultimoTurno = await Turno.findOne().sort({ id: -1 });
        const nuevoId = ultimoTurno ? ultimoTurno.id + 1 : 1;

        const nuevoTurno = await Turno.create({
            id: nuevoId,
            clienteId: clienteIdNumero,
            vehiculoId: vehiculoIdNumero,
            fecha,
            hora,
            servicio: servicio.trim()
        });

        res.status(201).json({
            mensaje: 'Turno creado con éxito',
            turno: nuevoTurno
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                mensaje: 'Ya existe un turno con esos datos únicos'
            });
        }
        next(error);
    }
};

// ACTUALIZAR TURNO
export const actualizarTurno = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                mensaje: 'El ID del turno debe ser un número entero válido'
            });
        }

        const turno = await Turno.findOne({ id });

        if (!turno) {
            return res.status(404).json({ mensaje: 'Turno no encontrado' });
        }

        const { clienteId, vehiculoId, fecha, hora, servicio } = req.body;

        const nuevoClienteId = clienteId !== undefined
            ? Number(clienteId)
            : turno.clienteId;

        const nuevoVehiculoId = vehiculoId !== undefined
            ? Number(vehiculoId)
            : turno.vehiculoId;

        if (
            !Number.isInteger(nuevoClienteId) || nuevoClienteId < 1 ||
            !Number.isInteger(nuevoVehiculoId) || nuevoVehiculoId < 1
        ) {
            return res.status(400).json({
                mensaje: 'Los identificadores del cliente y vehículo deben ser números válidos'
            });
        }

        const clienteExiste = await Cliente.findOne({ id: nuevoClienteId });

        if (!clienteExiste) {
            return res.status(400).json({
                mensaje: 'El cliente seleccionado no existe'
            });
        }

        const vehiculos = leerVehiculos();
        const vehiculo = vehiculos.find(v => v.id === nuevoVehiculoId);

        if (!vehiculo) {
            return res.status(400).json({
                mensaje: 'El vehículo seleccionado no existe'
            });
        }

        if (Number(vehiculo.clienteId) !== nuevoClienteId) {
            return res.status(400).json({
                mensaje: 'El vehículo seleccionado no pertenece al cliente indicado'
            });
        }

        if (
            servicio !== undefined &&
            (typeof servicio !== 'string' || servicio.trim().length < 3)
        ) {
            return res.status(400).json({
                mensaje: 'El servicio debe tener al menos 3 caracteres'
            });
        }

        turno.clienteId = nuevoClienteId;
        turno.vehiculoId = nuevoVehiculoId;
        if (fecha) turno.fecha = fecha;
        if (hora) turno.hora = hora;
        if (servicio !== undefined) turno.servicio = servicio.trim();

        await turno.save();

        res.json({ mensaje: 'Turno actualizado', turno });
    } catch (error) {
        next(error);
    }
};

// CANCELAR TURNO
export const cancelarTurnoPorId = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                mensaje: 'El ID del turno debe ser un número entero válido'
            });
        }

        const turno = await Turno.findOne({ id });

        if (!turno) {
            return res.status(404).json({ mensaje: 'Turno no encontrado' });
        }

        await Turno.deleteOne({ id });

        res.json({ mensaje: 'Turno cancelado correctamente' });
    } catch (error) {
        next(error);
    }
};