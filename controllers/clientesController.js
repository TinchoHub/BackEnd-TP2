const fs = require("fs");
const path = require("path");
const Cliente = require("../models/Cliente");

const rutaVehiculos = path.join(__dirname, "../data/vehiculos.json");
const rutaArchivo = path.join(__dirname, "../data/clientes.json");

const leerVehiculos = () => {
    if (!fs.existsSync(rutaVehiculos)) {
        return [];
    }

    const data = fs.readFileSync(rutaVehiculos, "utf-8");

    return data ? JSON.parse(data) : [];
};
// ==========================================
// LEER ARCHIVO DE CLIENTES
// ==========================================

const leerClientes = () => {
    if (!fs.existsSync(rutaArchivo)) {
        return [];
    }

    const data = fs.readFileSync(rutaArchivo, "utf-8");

    return data ? JSON.parse(data) : [];
};


// ==========================================
// GUARDAR ARCHIVO DE CLIENTES
// ==========================================

const guardarClientes = (clientes) => {
    fs.writeFileSync(
        rutaArchivo,
        JSON.stringify(clientes, null, 2)
    );
};


// ==========================================
// LISTAR CLIENTES
// ==========================================

const listarClientes = (req, res) => {
    const clientes = leerClientes();

    res.json(clientes);
};


// ==========================================
// CONSULTAR CLIENTE POR ID
// ==========================================

const consultarClientePorId = (req, res) => {
    const clientes = leerClientes();

    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            error: "Dato incorrecto",
            mensaje: "El ID del cliente debe ser un número entero válido"
        });
    }

    const cliente = clientes.find(
        cliente => cliente.id === id
    );

    if (!cliente) {
        return res.status(404).json({
            mensaje: "Cliente no encontrado"
        });
    }

    res.json(cliente);
};


// ==========================================
// AGREGAR CLIENTE
// ==========================================

const agregarCliente = (req, res) => {
    const clientes = leerClientes();

    const {
        nombre,
        apellido,
        telefono,
        email
    } = req.body;


    // Validar campos obligatorios
    if (!nombre || !apellido || !telefono || !email) {
        return res.status(400).json({
            mensaje:
                "Faltan campos obligatorios (nombre, apellido, telefono, email)"
        });
    }


    // Validar nombre
    if (nombre.trim().length < 2) {
        return res.status(400).json({
            mensaje:
                "El nombre debe tener al menos 2 caracteres"
        });
    }


    // Validar apellido
    if (apellido.trim().length < 2) {
        return res.status(400).json({
            mensaje:
                "El apellido debe tener al menos 2 caracteres"
        });
    }


    // Validar teléfono
    const telefonoValido = /^\d{7,15}$/;

    if (!telefonoValido.test(String(telefono))) {
        return res.status(400).json({
            mensaje:
                "El teléfono debe contener entre 7 y 15 números"
        });
    }


    // Validar email
    const emailValido =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValido.test(email)) {
        return res.status(400).json({
            mensaje:
                "El email no tiene un formato válido"
        });
    }


    // Evitar emails repetidos
    const emailExistente = clientes.find(
        cliente =>
            cliente.email.toLowerCase() ===
            email.toLowerCase()
    );

    if (emailExistente) {
        return res.status(400).json({
            mensaje:
                "Ya existe un cliente registrado con ese email"
        });
    }


    // Generar ID autoincremental
    const nuevoId =
        clientes.length > 0
            ? Math.max(
                  ...clientes.map(cliente => cliente.id)
              ) + 1
            : 1;


    // Crear objeto Cliente
    const nuevoCliente = new Cliente(
        nuevoId,
        nombre.trim(),
        apellido.trim(),
        String(telefono).trim(),
        email.trim().toLowerCase()
    );


    // Agregar cliente al array
    clientes.push(nuevoCliente);


    // Guardar cambios en JSON
    guardarClientes(clientes);


    // Respuesta
    res.status(201).json({
        mensaje: "Cliente agregado con éxito",
        cliente: nuevoCliente
    });
};


// ==========================================
// MODIFICAR CLIENTE
// ==========================================

const modificarClientePorId = (req, res) => {
    const clientes = leerClientes();

    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            error: "Dato incorrecto",
            mensaje: "El ID proporcionado debe ser un número entero válido"
        });
    }

    const clienteIndex = clientes.findIndex(
        cliente => cliente.id === id
    );


    if (clienteIndex === -1) {
        return res.status(404).json({
            mensaje: "Cliente no encontrado"
        });
    }


    const {
        nombre,
        apellido,
        telefono,
        email
    } = req.body;


    // Si se envía nombre, validarlo
    if (
        nombre &&
        nombre.trim().length < 2
    ) {
        return res.status(400).json({
            mensaje:
                "El nombre debe tener al menos 2 caracteres"
        });
    }


    // Si se envía apellido, validarlo
    if (
        apellido &&
        apellido.trim().length < 2
    ) {
        return res.status(400).json({
            mensaje:
                "El apellido debe tener al menos 2 caracteres"
        });
    }


    // Si se envía teléfono, validarlo
    if (telefono) {
        const telefonoValido = /^\d{7,15}$/;

        if (
            !telefonoValido.test(
                String(telefono)
            )
        ) {
            return res.status(400).json({
                mensaje:
                    "El teléfono debe contener entre 7 y 15 números"
            });
        }
    }


    // Si se envía email, validarlo
    if (email) {
        const emailValido =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailValido.test(email)) {
            return res.status(400).json({
                mensaje:
                    "El email no tiene un formato válido"
            });
        }


        // Comprobar que otro cliente no tenga ese email
        const emailExistente = clientes.find(
            cliente =>
                cliente.id !== id &&
                cliente.email.toLowerCase() ===
                    email.toLowerCase()
        );

        if (emailExistente) {
            return res.status(400).json({
                mensaje:
                    "Ya existe otro cliente registrado con ese email"
            });
        }
    }


    // Actualizar cliente
    clientes[clienteIndex] = new Cliente(
        id,

        nombre
            ? nombre.trim()
            : clientes[clienteIndex].nombre,

        apellido
            ? apellido.trim()
            : clientes[clienteIndex].apellido,

        telefono
            ? String(telefono).trim()
            : clientes[clienteIndex].telefono,

        email
            ? email.trim().toLowerCase()
            : clientes[clienteIndex].email
    );


    guardarClientes(clientes);


    res.json({
        mensaje: "Cliente modificado",
        cliente: clientes[clienteIndex]
    });
};


// ==========================================
// ELIMINAR CLIENTE
// ==========================================

const eliminarClientePorId = (req, res) => {
    const clientes = leerClientes();
    const vehiculos = leerVehiculos();

    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            error: "Dato incorrecto",
            mensaje: "El ID del cliente debe ser un número entero válido"
        });
    }

    const clienteIndex = clientes.findIndex(
        cliente => cliente.id === id
    );

    if (clienteIndex === -1) {
        return res.status(404).json({
            mensaje: "Cliente no encontrado"
        });
    }

    const tieneVehiculos = vehiculos.some(
        vehiculo => parseInt(vehiculo.clienteId) === id
    );

    if (tieneVehiculos) {
        return res.status(400).json({
            mensaje:
                "No se puede eliminar el cliente porque tiene vehículos asociados"
        });
    }

    clientes.splice(clienteIndex, 1);

    guardarClientes(clientes);

    res.json({
        mensaje: "Cliente eliminado correctamente"
    });
};


// ==========================================
// EXPORTAR FUNCIONES
// ==========================================

module.exports = {
    leerClientes,
    guardarClientes,
    listarClientes,
    agregarCliente,
    consultarClientePorId,
    modificarClientePorId,
    eliminarClientePorId
};