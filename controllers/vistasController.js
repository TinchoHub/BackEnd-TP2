import Cliente from '../models/Cliente.js';
import Vehiculo from '../models/Vehiculo.js';
import Turno from '../models/Turno.js';

import { agregarCliente, modificarClientePorId } from './clientesController.js';
import { agregarVehiculo } from './vehiculosController.js';
import { crearTurno } from './turnosController.js';

// Adaptador para reutilizar controladores desde formularios
const ejecutarAccion = async (controlador, req, res, destino) => {
  let codigoEstado = 200;
  let resultado;
  const respuesta = {
    status(codigo) {
      codigoEstado = codigo;
      return this;
    },
    json(datos) {
      resultado = datos;
      return this;
    },
    send(datos) {
      resultado = datos;
      return this;
    }
  };
  try {
    await controlador(req, respuesta, (err) => { throw err; });
    if (codigoEstado >= 400) {
      return res.status(codigoEstado).render('404', {
        titulo: 'Error en la operación',
        mensaje: resultado?.mensaje || resultado?.error || 'No se pudo completar la operación.'
      });
    }
    return res.redirect(destino);
  } catch (error) {
    return res.status(error.status || 500).render('404', {
      titulo: 'Error en la solicitud',
      mensaje: error.message || 'Ocurrió un error al procesar el formulario'
    });
  }
};

// Inicio
export const renderInicio = async (req, res, next) => {
  try {
    const totalClientes = await Cliente.countDocuments({ activo: true });
    const totalVehiculos = await Vehiculo.countDocuments({ activo: true });
    const totalTurnos = await Turno.countDocuments({ activo: true });
    res.render('index', {
      totalClientes,
      totalVehiculos,
      totalTurnos
    });
  } catch (error) {
    next(error);
  }
};

// Vistas Clientes
export const renderClientes = async (req, res, next) => {
  try {
    const clientes = await Cliente.find({ activo: true }).lean();
    res.render('clientes', { clientes });
  } catch (error) {
    next(error);
  }
};

export const renderNuevoCliente = (req, res) => {
  res.render('nuevoCliente');
};

export const renderClienteDetalle = async (req, res, next) => {
  try {
    const cliente = await Cliente.findOne({ _id: req.params.id, activo: true }).lean();
    if (!cliente) return res.status(404).render('404', { titulo: 'No encontrado', mensaje: 'Cliente no encontrado' });
    res.render('clienteDetalle', { cliente });
  } catch (error) {
    next(error);
  }
};

export const renderEditarCliente = async (req, res, next) => {
  try {
    const cliente = await Cliente.findOne({ _id: req.params.id, activo: true }).lean();
    if (!cliente) return res.status(404).render('404', { titulo: 'No encontrado', mensaje: 'Cliente no encontrado' });

    res.render('editarCliente', { cliente });
  } catch (error) {
    next(error);
  }
};

export const procesarNuevoCliente = async (req, res) => {
  await ejecutarAccion(agregarCliente, req, res, '/clientes');
};

export const procesarModificarCliente = async (req, res) => {
  await ejecutarAccion(modificarClientePorId, req, res, '/clientes');
};

// Vistas Vehículos
export const renderVehiculos = async (req, res, next) => {
  try {
    const vehiculos = await Vehiculo.find({ activo: true }).populate('clienteId').lean();
    res.render('vehiculos', { vehiculos });
  } catch (error) {
    next(error);
  }
};

export const renderNuevoVehiculo = async (req, res, next) => {
  try {
    const clientes = await Cliente.find({ activo: true }).lean();
    res.render('nuevoVehiculo', { clientes });
  } catch (error) {
    next(error);
  }
};

export const renderVehiculoDetalle = async (req, res, next) => {
  try {
    const vehiculo = await Vehiculo.findOne({ _id: req.params.id, activo: true }).populate('clienteId').lean();
    if (!vehiculo) return res.status(404).render('404', { titulo: 'No encontrado', mensaje: 'Vehículo no encontrado' });
    res.render('vehiculoDetalle', { vehiculo });
  } catch (error) {
    next(error);
  }
};

export const procesarNuevoVehiculo = async (req, res) => {
  await ejecutarAccion(agregarVehiculo, req, res, '/vehiculos');
};

// Vistas Turnos
export const renderTurnos = async (req, res, next) => {
  try {
    const turnos = await Turno.find({ activo: true })
      .populate('clienteId')
      .populate('vehiculoId')
      .lean();
    res.render('turnos', { turnos });
  } catch (error) {
    next(error);
  }
};

export const renderNuevoTurno = async (req, res, next) => {
  try {
    const clientes = await Cliente.find({ activo: true }).lean();
    const vehiculos = await Vehiculo.find({ activo: true }).lean();
    res.render('nuevoTurno', { clientes, vehiculos });
  } catch (error) {
    next(error);
  }
};

export const renderTurnoDetalle = async (req, res, next) => {
  try {
    const turno = await Turno.findOne({ _id: req.params.id, activo: true })
      .populate('clienteId')
      .populate('vehiculoId')
      .lean();
    if (!turno) return res.status(404).render('404', { titulo: 'No encontrado', mensaje: 'Turno no encontrado' });
    res.render('turnoDetalle', { turno });
  } catch (error) {
    next(error);
  }
};

export const procesarNuevoTurno = async (req, res) => {
  await ejecutarAccion(crearTurno, req, res, '/turnos');
};