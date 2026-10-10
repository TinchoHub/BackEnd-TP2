
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Cliente from '../models/Cliente.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rutaArchivo = path.join(__dirname, '../data/vehiculos.json');
const rutaTurnos = path.join(__dirname, '../data/turnos.json');

const leerArchivo = (ruta) => {
    if (!fs.existsSync(ruta)) return [];

    const data = fs.readFileSync(ruta, 'utf-8');
    return data ? JSON.parse(data) : [];
};

export const leerVehiculos = () => leerArchivo(rutaArchivo);
const leerTurnos = () => leerArchivo(rutaTurnos);

const guardarVehiculos = (vehiculos) => {
    fs.writeFileSync(
        rutaArchivo,
        JSON.stringify(vehiculos, null, 2),
        'utf-8'
    );
};

// LISTAR VEHÍCULOS
export const listarVehiculos = (req, res, next) => {
    try {
        res.json(leerVehiculos());
    } catch (error) {
        next(error);
    }
};

// CONSULTAR VEHÍCULO POR ID
export const consultarVehiculoPorId = (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                error: 'Dato incorrecto',
                mensaje: 'El ID del vehículo debe ser un número entero válido'
            });
        }

        const vehiculo = leerVehiculos().find(v => v.id === id);

        if (!vehiculo) {
            return res.status(404).json({
                mensaje: 'Vehículo no encontrado'
            });
        }

        res.json(vehiculo);
    } catch (error) {
        next(error);
    }
};

// AGREGAR VEHÍCULO
export const agregarVehiculo = async (req, res, next) => {
    try {
        const vehiculos = leerVehiculos();
        const { patente, marca, modelo, clienteId } = req.body;

        if (
            !patente?.trim() ||
            !marca?.trim() ||
            !modelo?.trim() ||
            clienteId === undefined ||
            clienteId === null ||
            String(clienteId).trim() === ''
        ) {
            return res.status(400).json({
                mensaje: 'Faltan datos obligatorios (patente, marca, modelo, clienteId)'
            });
        }

        const idCliente = Number(clienteId);

        if (!Number.isInteger(idCliente) || idCliente < 1) {
            return res.status(400).json({
                mensaje: 'El ID del cliente debe ser un número válido'
            });
        }

        const clienteExiste = await Cliente.findOne({ id: idCliente });

        if (!clienteExiste) {
            return res.status(400).json({
                mensaje: 'El cliente seleccionado no existe en la base de datos'
            });
        }

        const patenteLimpia = patente.trim().toUpperCase();

        if (vehiculos.some(v =>
            String(v.patente).toUpperCase() === patenteLimpia
        )) {
            return res.status(400).json({
                mensaje: 'Ya existe un vehículo registrado con esa patente'
            });
        }

        const nuevoId = vehiculos.length > 0
            ? Math.max(...vehiculos.map(v => Number(v.id) || 0)) + 1
            : 1;

        const nuevoVehiculo = {
            id: nuevoId,
            patente: patenteLimpia,
            marca: marca.trim(),
            modelo: modelo.trim(),
            clienteId: idCliente
        };

        vehiculos.push(nuevoVehiculo);
        guardarVehiculos(vehiculos);

        res.status(201).json({
            mensaje: 'Vehículo creado',
            vehiculo: nuevoVehiculo
        });
    } catch (error) {
        next(error);
    }
};

// MODIFICAR VEHÍCULO
export const modificarVehiculoPorId = async (req, res, next) => {
    try {
        const vehiculos = leerVehiculos();
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                mensaje: 'El ID del vehículo debe ser un número válido'
            });
        }

        const index = vehiculos.findIndex(v => v.id === id);

        if (index === -1) {
            return res.status(404).json({
                mensaje: 'Vehículo no encontrado para modificar'
            });
        }

        const { patente, marca, modelo, clienteId } = req.body;

        let nuevoClienteId = vehiculos[index].clienteId;

        if (clienteId !== undefined) {
            nuevoClienteId = Number(clienteId);

            if (!Number.isInteger(nuevoClienteId) || nuevoClienteId < 1) {
                return res.status(400).json({
                    mensaje: 'El ID del cliente debe ser un número válido'
                });
            }

            const clienteExiste = await Cliente.findOne({
                id: nuevoClienteId
            });

            if (!clienteExiste) {
                return res.status(400).json({
                    mensaje: 'El cliente seleccionado no existe en la base de datos'
                });
            }
        }

        const nuevaPatente = patente !== undefined
            ? String(patente).trim().toUpperCase()
            : vehiculos[index].patente;

        if (!nuevaPatente) {
            return res.status(400).json({
                mensaje: 'La patente no puede estar vacía'
            });
        }

        const patenteDuplicada = vehiculos.some(v =>
            v.id !== id &&
            String(v.patente).toUpperCase() === nuevaPatente
        );

        if (patenteDuplicada) {
            return res.status(400).json({
                mensaje: 'Ya existe un vehículo registrado con esa patente'
            });
        }

        vehiculos[index] = {
            ...vehiculos[index],
            patente: nuevaPatente,
            marca: marca !== undefined
                ? String(marca).trim()
                : vehiculos[index].marca,
            modelo: modelo !== undefined
                ? String(modelo).trim()
                : vehiculos[index].modelo,
            clienteId: nuevoClienteId
        };

        guardarVehiculos(vehiculos);

        res.json({
            mensaje: 'Vehículo modificado con éxito',
            vehiculo: vehiculos[index]
        });
    } catch (error) {
        next(error);
    }
};

// ELIMINAR VEHÍCULO
export const eliminarVehiculoPorId = (req, res, next) => {
    try {
        const vehiculos = leerVehiculos();
        const turnos = leerTurnos();
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                error: 'Dato incorrecto',
                mensaje: 'El ID del vehículo debe ser un número entero válido'
            });
        }

        const vehiculoIndex = vehiculos.findIndex(
            vehiculo => vehiculo.id === id
        );

        if (vehiculoIndex === -1) {
            return res.status(404).json({
                mensaje: 'Vehículo no encontrado'
            });
        }

        const tieneTurnos = turnos.some(
            turno => Number(turno.vehiculoId) === id
        );

        if (tieneTurnos) {
            return res.status(400).json({
                mensaje: 'No se puede eliminar el vehículo porque tiene turnos asociados'
            });
        }

        vehiculos.splice(vehiculoIndex, 1);
        guardarVehiculos(vehiculos);

        res.json({
            mensaje: 'Vehículo eliminado correctamente'
        });
    } catch (error) {
        next(error);
    }
};