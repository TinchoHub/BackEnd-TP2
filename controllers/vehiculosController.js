import Vehiculo from '../models/Vehiculo.js';
import Cliente from '../models/Cliente.js';
import Turno from '../models/Turno.js';
// Función de compatibilidad para otros módulos (como turnos)
export const leerVehiculos = async () => {
    return await Vehiculo.find();
};

// LISTAR VEHÍCULOS
export const listarVehiculos = async (req, res, next) => {
    try {
        const vehiculos = await Vehiculo.find();
        res.json(vehiculos);
    } catch (error) {
        next(error);
    }
};

// CONSULTAR VEHÍCULO POR ID
export const consultarVehiculoPorId = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                error: 'Dato incorrecto',
                mensaje: 'El ID del vehículo debe ser un número entero válido'
            });
        }

        const vehiculo = await Vehiculo.findOne({ id });

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

        const patenteDuplicada = await Vehiculo.findOne({ patente: patenteLimpia });
        if (patenteDuplicada) {
            return res.status(400).json({
                mensaje: 'Ya existe un vehículo registrado con esa patente'
            });
        }

        // Buscar el último ID numérico para auto-incrementar
        const ultimoVehiculo = await Vehiculo.findOne().sort({ id: -1 });
        const nuevoId = ultimoVehiculo ? Number(ultimoVehiculo.id) + 1 : 1;

        const nuevoVehiculo = await Vehiculo.create({
            id: nuevoId,
            patente: patenteLimpia,
            marca: marca.trim(),
            modelo: modelo.trim(),
            clienteId: idCliente
        });

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
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                mensaje: 'El ID del vehículo debe ser un número válido'
            });
        }

        const vehiculoExistente = await Vehiculo.findOne({ id });

        if (!vehiculoExistente) {
            return res.status(404).json({
                mensaje: 'Vehículo no encontrado para modificar'
            });
        }

        const { patente, marca, modelo, clienteId } = req.body;
        let nuevoClienteId = vehiculoExistente.clienteId;

        if (clienteId !== undefined) {
            nuevoClienteId = Number(clienteId);

            if (!Number.isInteger(nuevoClienteId) || nuevoClienteId < 1) {
                return res.status(400).json({
                    mensaje: 'El ID del cliente debe ser un número válido'
                });
            }

            const clienteExiste = await Cliente.findOne({ id: nuevoClienteId });

            if (!clienteExiste) {
                return res.status(400).json({
                    mensaje: 'El cliente seleccionado no existe en la base de datos'
                });
            }
        }

        let nuevaPatente = vehiculoExistente.patente;
        if (patente !== undefined) {
            nuevaPatente = String(patente).trim().toUpperCase();
            if (!nuevaPatente) {
                return res.status(400).json({
                    mensaje: 'La patente no puede estar vacía'
                });
            }

            const patenteDuplicada = await Vehiculo.findOne({
                id: { $ne: id },
                patente: nuevaPatente
            });

            if (patenteDuplicada) {
                return res.status(400).json({
                    mensaje: 'Ya existe un vehículo registrado con esa patente'
                });
            }
        }

        const vehiculoActualizado = await Vehiculo.findOneAndUpdate(
            { id },
            {
                patente: nuevaPatente,
                marca: marca !== undefined ? String(marca).trim() : vehiculoExistente.marca,
                modelo: modelo !== undefined ? String(modelo).trim() : vehiculoExistente.modelo,
                clienteId: nuevoClienteId
            },
            { new: true, runValidators: true }
        );

        res.json({
            mensaje: 'Vehículo modificado con éxito',
            vehiculo: vehiculoActualizado
        });
    } catch (error) {
        next(error);
    }
};

// ELIMINAR VEHÍCULO
export const eliminarVehiculoPorId = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                error: 'Dato incorrecto',
                mensaje: 'El ID del vehículo debe ser un número entero válido'
            });
        }

        const vehiculo = await Vehiculo.findOne({ id });

        if (!vehiculo) {
            return res.status(404).json({
                mensaje: 'Vehículo no encontrado'
            });
        }

        // Restricción: verificar si tiene turnos asociados usando el modelo de Turno de Mongoose
        const tieneTurnos = await Turno.findOne({ vehiculoId: id });

        if (tieneTurnos) {
            return res.status(400).json({
                mensaje: 'No se puede eliminar el vehículo porque tiene turnos asociados'
            });
        }

        await Vehiculo.findOneAndDelete({ id });

        res.json({
            mensaje: 'Vehículo eliminado correctamente'
        });
    } catch (error) {
        next(error);
    }
};