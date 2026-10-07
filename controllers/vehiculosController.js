const fs = require("fs");
const path = require("path");
const Vehiculo = require("../models/Vehiculo");

const { leerClientes } = require("./clientesController");

const rutaArchivo = path.join(__dirname, "../data/vehiculos.json");
const rutaTurnos = path.join(__dirname, "../data/turnos.json");

//LEER ARCHIVO DE VEHICULOS
const leerVehiculos = () => {
    if (!fs.existsSync(rutaArchivo)) {
        return [];
    }
    const data = fs.readFileSync(rutaArchivo, "utf-8");
    return data ? JSON.parse(data) : [];
};

const leerTurnos = () => {
    if (!fs.existsSync(rutaTurnos)) {
        return [];
    }

    const data = fs.readFileSync(rutaTurnos, "utf-8");

    return data ? JSON.parse(data) : [];
};

//GUARDAR ARCHIVO DE VEHICULOS
const guardarVehiculos = (vehiculos) => {
    fs.writeFileSync(rutaArchivo, JSON.stringify(vehiculos, null, 2), "utf-8");
};

//LISTAR VEHICULOS
const listarVehiculos = (req, res) => {
    const vehiculos = leerVehiculos();
    res.json(vehiculos);
};

//CONSULTAR VEHICULO POR ID
const consultarVehiculoPorId = (req, res) => {
    const vehiculos = leerVehiculos();
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({
            error: "Dato incorrecto",
            mensaje: "El ID del vehículo debe ser un número entero válido"
        });
    }
    const vehiculo = vehiculos.find(v => v.id === id);
    if (!vehiculo) {
        return res.status(404).json({
            mensaje: "Vehículo no encontrado"
        });
    }
    res.json(vehiculo);
};

//AGREGAR VEHICULO
const agregarVehiculo = (req, res) => {
    const vehiculos = leerVehiculos();
    const { patente, marca, modelo, clienteId } = req.body;
    if (!patente || !marca || !modelo || !clienteId) {
        return res.status(400).json({ mensaje: 'Faltan datos obligatorios (patente, marca, modelo, clienteId)' });
    }
    const clientes = leerClientes();

const clienteExiste = clientes.some(
    cliente => cliente.id === parseInt(clienteId)
);

if (!clienteExiste) {
    return res.status(400).json({
        mensaje: "El cliente seleccionado no existe"
    });
}
    const nuevoId = vehiculos.length > 0 ? Math.max(...vehiculos.map(v => v.id || 0)) + 1 : 1;
    const nuevoVehiculo = new Vehiculo(nuevoId, patente, marca, modelo, parseInt(clienteId));    
    vehiculos.push(nuevoVehiculo);
    guardarVehiculos(vehiculos);    
    res.status(201).json({ mensaje: "Vehículo creado", vehiculo: nuevoVehiculo });
};

// MODIFICAR VEHICULO
const modificarVehiculoPorId = (req, res) => {
    const vehiculos = leerVehiculos();
    const id = parseInt(req.params.id);
    const index = vehiculos.findIndex(v => v.id === id);
    if (index === -1) {
        return res.status(404).json({ mensaje: "Vehículo no encontrado para modificar" });
    }
    const { patente, marca, modelo, clienteId } = req.body;
    vehiculos[index] = new Vehiculo(
        id,
        patente || vehiculos[index].patente,
        marca || vehiculos[index].marca,
        modelo || vehiculos[index].modelo,
        clienteId ? parseInt(clienteId) : vehiculos[index].clienteId
    );
    guardarVehiculos(vehiculos);
    res.json({ mensaje: "Vehículo modificado con éxito", vehiculo: vehiculos[index] });
};

// ELIMINAR VEHICULO
const eliminarVehiculoPorId = (req, res) => {
    const vehiculos = leerVehiculos();
    const turnos = leerTurnos();

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({
            error: "Dato incorrecto",
            mensaje: "El ID del vehículo debe ser un número entero válido"
        });
    }

    const vehiculoIndex = vehiculos.findIndex(
        vehiculo => vehiculo.id === id
    );

    if (vehiculoIndex === -1) {
        return res.status(404).json({
            mensaje: "Vehículo no encontrado"
        });
    }

    const tieneTurnos = turnos.some(
        turno => parseInt(turno.vehiculoId) === id
    );

    if (tieneTurnos) {
        return res.status(400).json({
            mensaje:
                "No se puede eliminar el vehículo porque tiene turnos asociados"
        });
    }

    vehiculos.splice(vehiculoIndex, 1);

    guardarVehiculos(vehiculos);

    res.json({
        mensaje: "Vehículo eliminado correctamente"
    });
};

module.exports = {
    leerVehiculos,
    guardarVehiculos,
    listarVehiculos,
    consultarVehiculoPorId,
    agregarVehiculo,
    modificarVehiculoPorId,
    eliminarVehiculoPorId
};