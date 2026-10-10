
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Cliente from '../models/Cliente.js';

import {
  agregarCliente
} from './clientesController.js';

import {
  leerVehiculos,
  agregarVehiculo
} from './vehiculosController.js';

import {
  crearTurno
} from './turnosController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rutaTurnos = path.join(__dirname, '../data/turnos.json');

// Lee los turnos guardados en el archivo JSON.
const leerTurnos = () => {
  if (!fs.existsSync(rutaTurnos)) {
    return [];
  }

  const contenido = fs.readFileSync(rutaTurnos, 'utf-8');
  return contenido ? JSON.parse(contenido) : [];
};

// Permite reutilizar los controladores de la API desde los formularios.
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
    await controlador(req, respuesta);

    if (codigoEstado >= 400) {
      return res
        .status(codigoEstado)
        .send(resultado?.mensaje || resultado?.error || 'No se pudo completar la operación.');
    }

    return res.redirect(destino);
  } catch (error) {
    console.error('Error al procesar el formulario:', error);
    return res.status(500).send('Ocurrió un error al procesar el formulario.');
  }
};

// Inicio
export const renderInicio = async (req, res, next) => {
  try {
    const totalClientes = await Cliente.countDocuments();
    const totalVehiculos = leerVehiculos().length;
    const totalTurnos = leerTurnos().length;

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
    const clientes = await Cliente.find().sort({ id: 1 }).lean();
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
    const id = Number(req.params.id);
    const cliente = await Cliente.findOne({ id }).lean();

    res.render('clienteDetalle', { cliente });
  } catch (error) {
    next(error);
  }
};

export const procesarNuevoCliente = async (req, res) => {
  await ejecutarAccion(agregarCliente, req, res, '/clientes');
};

// Vistas Vehículos
export const renderVehiculos = (req, res) => {
  res.render('vehiculos', { vehiculos: leerVehiculos() });
};

export const renderNuevoVehiculo = async (req, res, next) => {
  try {
    const clientes = await Cliente.find().sort({ id: 1 }).lean();
    res.render('nuevoVehiculo', { clientes });
  } catch (error) {
    next(error);
  }
};

export const renderVehiculoDetalle = (req, res) => {
  const vehiculos = leerVehiculos();
  const vehiculo = vehiculos.find(
    v => v.id === Number(req.params.id)
  );

  res.render('vehiculoDetalle', { vehiculo });
};

export const procesarNuevoVehiculo = async (req, res) => {
  await ejecutarAccion(agregarVehiculo, req, res, '/vehiculos');
};

// Vistas Turnos
export const renderTurnos = (req, res) => {
  res.render('turnos', { turnos: leerTurnos() });
};

export const renderNuevoTurno = async (req, res, next) => {
  try {
    const clientes = await Cliente.find().sort({ id: 1 }).lean();
    const vehiculos = leerVehiculos();

    res.render('nuevoTurno', {
      clientes,
      vehiculos
    });
  } catch (error) {
    next(error);
  }
};

export const renderTurnoDetalle = (req, res) => {
  const turnos = leerTurnos();
  const turno = turnos.find(
    t => t.id === Number(req.params.id)
  );

  res.render('turnoDetalle', { turno });
};

export const procesarNuevoTurno = async (req, res) => {
  await ejecutarAccion(crearTurno, req, res, '/turnos');
};