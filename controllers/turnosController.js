
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Turno from '../models/Turno.js';
import Cliente from '../models/Cliente.js';
import { leerVehiculos } from './vehiculosController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rutaArchivo = path.join(__dirname, '../data/turnos.json');

const leerTurnos = () => {
    if (!fs.existsSync(rutaArchivo)) return [];
    const data = fs.readFileSync(rutaArchivo, 'utf-8');
    return data ? JSON.parse(data) : [];
};

const guardarTurnos = (turnos) => {
    fs.writeFileSync(rutaArchivo, JSON.stringify(turnos, null, 2), 'utf-8');
};

export const listarTurnos = (req, res, next) => {
    try {
        res.json(leerTurnos());
    } catch (error) {
        next(error);
    }
};

export const consultarTurnoPorId = (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                mensaje: 'El ID del turno debe ser un número entero válido'
            });
        }

        const turno = leerTurnos().find(t => t.id === id);

        if (!turno) {
            return res.status(404).json({ mensaje: 'Turno no encontrado' });
        }

        res.json(turno);
    } catch (error) {
        next(error);
    }
};

export const crearTurno = async (req, res, next) => {
    try {
        const turnos = leerTurnos();
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

        const nuevoId = turnos.length
            ? Math.max(...turnos.map(t => Number(t.id) || 0)) + 1
            : 1;

        const nuevoTurno = new Turno(
            nuevoId,
            clienteIdNumero,
            vehiculoIdNumero,
            fecha,
            hora,
            servicio.trim()
        );

        turnos.push(nuevoTurno);
        guardarTurnos(turnos);

        res.status(201).json({
            mensaje: 'Turno creado con éxito',
            turno: nuevoTurno
        });
    } catch (error) {
        next(error);
    }
};

export const actualizarTurno = async (req, res, next) => {
    try {
        const turnos = leerTurnos();
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                mensaje: 'El ID del turno debe ser un número entero válido'
            });
        }

        const indice = turnos.findIndex(t => t.id === id);

        if (indice === -1) {
            return res.status(404).json({ mensaje: 'Turno no encontrado' });
        }

        const actual = turnos[indice];
        const { clienteId, vehiculoId, fecha, hora, servicio } = req.body;

        const nuevoClienteId = clienteId !== undefined
            ? Number(clienteId)
            : actual.clienteId;

        const nuevoVehiculoId = vehiculoId !== undefined
            ? Number(vehiculoId)
            : actual.vehiculoId;

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

        const vehiculo = leerVehiculos().find(v => v.id === nuevoVehiculoId);

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

        const actualizado = new Turno(
            id,
            nuevoClienteId,
            nuevoVehiculoId,
            fecha || actual.fecha,
            hora || actual.hora,
            servicio !== undefined ? servicio.trim() : actual.servicio
        );

        turnos[indice] = actualizado;
        guardarTurnos(turnos);

        res.json({ mensaje: 'Turno actualizado', turno: actualizado });
    } catch (error) {
        next(error);
    }
};

export const cancelarTurnoPorId = (req, res, next) => {
    try {
        const turnos = leerTurnos();
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                mensaje: 'El ID del turno debe ser un número entero válido'
            });
        }

        const indice = turnos.findIndex(t => t.id === id);

        if (indice === -1) {
            return res.status(404).json({ mensaje: 'Turno no encontrado' });
        }

        turnos.splice(indice, 1);
        guardarTurnos(turnos);

        res.json({ mensaje: 'Turno cancelado correctamente' });
    } catch (error) {
        next(error);
    }
};