const { leerClientes, agregarCliente } = require("./clientesController");
const { leerVehiculos, agregarVehiculo } = require("./vehiculosController");
const { leerTurnos, crearTurno } = require("./turnosController");

// Vista Inicio (Dashboard con métricas reales)
const renderInicio = (req, res) => {
    const clientes = leerClientes();
    const vehiculos = leerVehiculos();
    const turnos = leerTurnos();

    res.render("index", {
        totalClientes: clientes.length,
        totalVehiculos: vehiculos.length,
        totalTurnos: turnos.length
    });
};

// Vistas Clientes
const renderClientes = (req, res) => {
    res.render("clientes", { clientes: leerClientes() });
};

const renderNuevoCliente = (req, res) => {
    res.render("nuevoCliente");
};

const renderClienteDetalle = (req, res) => {
    const clientes = leerClientes();
    const cliente = clientes.find(c => c.id === parseInt(req.params.id));
    res.render("clienteDetalle", { cliente });
};

const procesarNuevoCliente = (req, res) => {
    agregarCliente(req, { status: () => ({ json: () => {} }), json: () => {} });
    res.redirect("/clientes");
};

// Vistas Vehículos
const renderVehiculos = (req, res) => {
    res.render("vehiculos", { vehiculos: leerVehiculos() });
};

const renderNuevoVehiculo = (req, res) => {
    const clientes = leerClientes();

    res.render("nuevoVehiculo", {
        clientes
    });
};

const renderVehiculoDetalle = (req, res) => {
    const vehiculos = leerVehiculos();
    const vehiculo = vehiculos.find(v => v.id === parseInt(req.params.id));
    res.render("vehiculoDetalle", { vehiculo });
};

const procesarNuevoVehiculo = (req, res) => {
    agregarVehiculo(req, { status: () => ({ json: () => {} }), json: () => {} });
    res.redirect("/vehiculos");
};

// Vistas Turnos
const renderTurnos = (req, res) => {
    res.render("turnos", { turnos: leerTurnos() });
};

const renderNuevoTurno = (req, res) => {
    const clientes = leerClientes();
    const vehiculos = leerVehiculos();

    res.render("nuevoTurno", {
        clientes,
        vehiculos
    });
};

const renderTurnoDetalle = (req, res) => {
    const turnos = leerTurnos();
    const turno = turnos.find(t => t.id === parseInt(req.params.id));
    res.render("turnoDetalle", { turno });
};

const procesarNuevoTurno = (req, res) => {
    crearTurno(req, { status: () => ({ json: () => {} }), json: () => {} });
    res.redirect("/turnos");
};

module.exports = {
    renderInicio,
    renderClientes,
    renderNuevoCliente,
    renderClienteDetalle,
    procesarNuevoCliente,
    renderVehiculos,
    renderNuevoVehiculo,
    renderVehiculoDetalle,
    procesarNuevoVehiculo,
    renderTurnos,
    renderNuevoTurno,
    renderTurnoDetalle,
    procesarNuevoTurno
};