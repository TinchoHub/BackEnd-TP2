const fs = require("fs");
const path = require("path");
const Turno = require("../models/Turno");

const { leerClientes } = require("./clientesController");
const { leerVehiculos } = require("./vehiculosController");

const rutaArchivo = path.join(__dirname, "../data/turnos.json");


// ==========================================
// LEER TURNOS
// ==========================================

const leerTurnos = () => {
    if (!fs.existsSync(rutaArchivo)) {
        return [];
    }

    const data = fs.readFileSync(rutaArchivo, "utf-8");

    return data ? JSON.parse(data) : [];
};


// ==========================================
// GUARDAR TURNOS
// ==========================================

const guardarTurnos = (turnos) => {
    fs.writeFileSync(
        rutaArchivo,
        JSON.stringify(turnos, null, 2)
    );
};


// ==========================================
// LISTAR TURNOS
// ==========================================

const listarTurnos = (req, res) => {
    const turnos = leerTurnos();

    res.json(turnos);
};


// ==========================================
// CONSULTAR TURNO POR ID
// ==========================================

const consultarTurnoPorId = (req, res) => {
    const turnos = leerTurnos();

    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            error: "Dato incorrecto",
            mensaje: "El ID del turno debe ser un número entero válido"
        });
    }

    const turno = turnos.find(
        turno => turno.id === id
    );

    if (!turno) {
        return res.status(404).json({
            mensaje: "Turno no encontrado"
        });
    }

    res.json(turno);
};


// ==========================================
// CREAR TURNO
// ==========================================

const crearTurno = (req, res) => {
    const turnos = leerTurnos();

    const {
        clienteId,
        vehiculoId,
        fecha,
        hora,
        servicio
    } = req.body;


    // Validar campos obligatorios
    if (
        !clienteId ||
        !vehiculoId ||
        !fecha ||
        !hora ||
        !servicio
    ) {
        return res.status(400).json({
            mensaje:
                "Faltan datos obligatorios (clienteId, vehiculoId, fecha, hora, servicio)"
        });
    }


    const clienteIdNumero = parseInt(clienteId);
    const vehiculoIdNumero = parseInt(vehiculoId);


    // Validar cliente
    const clientes = leerClientes();

    const clienteExiste = clientes.some(
        cliente => cliente.id === clienteIdNumero
    );

    if (!clienteExiste) {
        return res.status(400).json({
            mensaje: "El cliente seleccionado no existe"
        });
    }


    // Validar vehículo
    const vehiculos = leerVehiculos();

    const vehiculoExiste = vehiculos.some(
        vehiculo => vehiculo.id === vehiculoIdNumero
    );

    if (!vehiculoExiste) {
        return res.status(400).json({
            mensaje: "El vehículo seleccionado no existe"
        });
    }


    // Verificar que el vehículo pertenezca al cliente
    const vehiculoSeleccionado = vehiculos.find(
        vehiculo => vehiculo.id === vehiculoIdNumero
    );

    if (
        vehiculoSeleccionado.clienteId !== clienteIdNumero
    ) {
        return res.status(400).json({
            mensaje:
                "El vehículo seleccionado no pertenece al cliente indicado"
        });
    }


    // Validar servicio
    if (servicio.trim().length < 3) {
        return res.status(400).json({
            mensaje:
                "El servicio debe tener al menos 3 caracteres"
        });
    }


    // Generar ID
    const nuevoId =
        turnos.length > 0
            ? Math.max(
                  ...turnos.map(turno => turno.id)
              ) + 1
            : 1;


    // Crear turno
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
        mensaje: "Turno creado con éxito",
        turno: nuevoTurno
    });
};


// ==========================================
// ACTUALIZAR TURNO
// ==========================================

const actualizarTurno = (req, res) => {
    const turnos = leerTurnos();

    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            error: "Dato incorrecto",
            mensaje: "El ID del turno debe ser un número entero válido"
        });
    }

    const turnoIndex = turnos.findIndex(
        turno => turno.id === id
    );


    if (turnoIndex === -1) {
        return res.status(404).json({
            mensaje: "Turno no encontrado"
        });
    }


    const turnoActual = turnos[turnoIndex];

    const {
        clienteId,
        vehiculoId,
        fecha,
        hora,
        servicio
    } = req.body;


    const nuevoClienteId =
        clienteId !== undefined
            ? parseInt(clienteId)
            : turnoActual.clienteId;

    const nuevoVehiculoId =
        vehiculoId !== undefined
            ? parseInt(vehiculoId)
            : turnoActual.vehiculoId;


    // Validar cliente
    const clientes = leerClientes();

    const clienteExiste = clientes.some(
        cliente => cliente.id === nuevoClienteId
    );

    if (!clienteExiste) {
        return res.status(400).json({
            mensaje: "El cliente seleccionado no existe"
        });
    }


    // Validar vehículo
    const vehiculos = leerVehiculos();

    const vehiculoSeleccionado = vehiculos.find(
        vehiculo => vehiculo.id === nuevoVehiculoId
    );

    if (!vehiculoSeleccionado) {
        return res.status(400).json({
            mensaje: "El vehículo seleccionado no existe"
        });
    }


    // Verificar relación vehículo-cliente
    if (
        vehiculoSeleccionado.clienteId !== nuevoClienteId
    ) {
        return res.status(400).json({
            mensaje:
                "El vehículo seleccionado no pertenece al cliente indicado"
        });
    }


    // Validar servicio si se envía
    if (
        servicio !== undefined &&
        servicio.trim().length < 3
    ) {
        return res.status(400).json({
            mensaje:
                "El servicio debe tener al menos 3 caracteres"
        });
    }


    const turnoActualizado = new Turno(
        id,
        nuevoClienteId,
        nuevoVehiculoId,
        fecha || turnoActual.fecha,
        hora || turnoActual.hora,
        servicio !== undefined
            ? servicio.trim()
            : turnoActual.servicio
    );


    turnos[turnoIndex] = turnoActualizado;

    guardarTurnos(turnos);


    res.json({
        mensaje: "Turno actualizado",
        turno: turnoActualizado
    });
};


// ==========================================
// CANCELAR / ELIMINAR TURNO
// ==========================================

const cancelarTurnoPorId = (req, res) => {
    const turnos = leerTurnos();

    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            error: "Dato incorrecto",
            mensaje: "El ID del turno debe ser un número entero válido"
        });
    }

    const turnoIndex = turnos.findIndex(
        turno => turno.id === id
    );


    if (turnoIndex === -1) {
        return res.status(404).json({
            mensaje: "Turno no encontrado"
        });
    }


    turnos.splice(turnoIndex, 1);

    guardarTurnos(turnos);


    res.json({
        mensaje: "Turno cancelado correctamente"
    });
};


// ==========================================
// EXPORTAR FUNCIONES
// ==========================================

module.exports = {
    leerTurnos,
    guardarTurnos,
    listarTurnos,
    crearTurno,
    consultarTurnoPorId,
    cancelarTurnoPorId,
    actualizarTurno
};
