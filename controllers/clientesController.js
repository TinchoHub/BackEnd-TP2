import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Cliente from '../models/Cliente.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rutaVehiculos = path.join(__dirname, '../data/vehiculos.json');

// Leer los vehículos para comprobar las relaciones con clientes.
const leerVehiculos = () => {
    if (!fs.existsSync(rutaVehiculos)) {
        return [];
    }

    const data = fs.readFileSync(rutaVehiculos, 'utf-8');
    return data ? JSON.parse(data) : [];
};

// LISTAR CLIENTES
export const listarClientes = async (req, res, next) => {
    try {
        const clientes = await Cliente.find().sort({ id: 1 });
        res.json(clientes);
    } catch (error) {
        next(error);
    }
};

// CONSULTAR CLIENTE POR ID
export const consultarClientePorId = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                mensaje: 'El ID del cliente debe ser un número entero válido'
            });
        }

        const cliente = await Cliente.findOne({ id });

        if (!cliente) {
            return res.status(404).json({
                mensaje: 'Cliente no encontrado'
            });
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

        if (
            !nombre?.trim() ||
            !apellido?.trim() ||
            !telefono ||
            !email?.trim()
        ) {
            return res.status(400).json({
                mensaje: 'Faltan campos obligatorios (nombre, apellido, telefono, email)'
            });
        }

        if (nombre.trim().length < 2) {
            return res.status(400).json({
                mensaje: 'El nombre debe tener al menos 2 caracteres'
            });
        }

        if (apellido.trim().length < 2) {
            return res.status(400).json({
                mensaje: 'El apellido debe tener al menos 2 caracteres'
            });
        }

        const telefonoLimpio = String(telefono).trim();

        if (!/^\d{7,15}$/.test(telefonoLimpio)) {
            return res.status(400).json({
                mensaje: 'El teléfono debe contener entre 7 y 15 números'
            });
        }

        const emailLimpio = email.trim().toLowerCase();
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailValido.test(emailLimpio)) {
            return res.status(400).json({
                mensaje: 'El email no tiene un formato válido'
            });
        }

        const emailExistente = await Cliente.findOne({
            email: emailLimpio
        });

        if (emailExistente) {
            return res.status(400).json({
                mensaje: 'Ya existe un cliente registrado con ese email'
            });
        }

        const ultimoCliente = await Cliente.findOne().sort({ id: -1 });
        const nuevoId = ultimoCliente ? ultimoCliente.id + 1 : 1;

        const nuevoCliente = await Cliente.create({
            id: nuevoId,
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            telefono: telefonoLimpio,
            email: emailLimpio
        });

        res.status(201).json({
            mensaje: 'Cliente agregado con éxito',
            cliente: nuevoCliente
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                mensaje: 'Ya existe un cliente con esos datos únicos'
            });
        }

        next(error);
    }
};

// MODIFICAR CLIENTE
export const modificarClientePorId = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                mensaje: 'El ID proporcionado debe ser un número entero válido'
            });
        }

        const cliente = await Cliente.findOne({ id });

        if (!cliente) {
            return res.status(404).json({
                mensaje: 'Cliente no encontrado'
            });
        }

        const { nombre, apellido, telefono, email } = req.body;

        if (nombre !== undefined) {
            if (typeof nombre !== 'string' || nombre.trim().length < 2) {
                return res.status(400).json({
                    mensaje: 'El nombre debe tener al menos 2 caracteres'
                });
            }

            cliente.nombre = nombre.trim();
        }

        if (apellido !== undefined) {
            if (typeof apellido !== 'string' || apellido.trim().length < 2) {
                return res.status(400).json({
                    mensaje: 'El apellido debe tener al menos 2 caracteres'
                });
            }

            cliente.apellido = apellido.trim();
        }

        if (telefono !== undefined) {
            const telefonoLimpio = String(telefono).trim();

            if (!/^\d{7,15}$/.test(telefonoLimpio)) {
                return res.status(400).json({
                    mensaje: 'El teléfono debe contener entre 7 y 15 números'
                });
            }

            cliente.telefono = telefonoLimpio;
        }

        if (email !== undefined) {
            if (typeof email !== 'string') {
                return res.status(400).json({
                    mensaje: 'El email no tiene un formato válido'
                });
            }

            const emailLimpio = email.trim().toLowerCase();

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio)) {
                return res.status(400).json({
                    mensaje: 'El email no tiene un formato válido'
                });
            }

            const emailExistente = await Cliente.findOne({
                email: emailLimpio,
                id: { $ne: id }
            });

            if (emailExistente) {
                return res.status(400).json({
                    mensaje: 'Ya existe otro cliente registrado con ese email'
                });
            }

            cliente.email = emailLimpio;
        }

        await cliente.save();

        res.json({
            mensaje: 'Cliente modificado',
            cliente
        });
    } catch (error) {
        next(error);
    }
};

// ELIMINAR CLIENTE
export const eliminarClientePorId = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                mensaje: 'El ID del cliente debe ser un número entero válido'
            });
        }

        const cliente = await Cliente.findOne({ id });

        if (!cliente) {
            return res.status(404).json({
                mensaje: 'Cliente no encontrado'
            });
        }

        const vehiculos = leerVehiculos();

        const tieneVehiculos = vehiculos.some(
            vehiculo => Number(vehiculo.clienteId) === id
        );

        if (tieneVehiculos) {
            return res.status(400).json({
                mensaje: 'No se puede eliminar el cliente porque tiene vehículos asociados'
            });
        }

        await Cliente.deleteOne({ id });

        res.json({
            mensaje: 'Cliente eliminado correctamente'
        });
    } catch (error) {
        next(error);
    }
};