const errorHandler = (err, req, res, next) => {
    console.error("Error capturado:", err);

    let statusCode = err.status || 500;
    let titulo = "Error en el servidor";
    let mensaje = err.message || "Ocurrió un error inesperado al procesar la solicitud.";
    let detalles = [];

    // 1. Error de validación de Mongoose
    if (err.name === 'ValidationError') {
        statusCode = 400;
        titulo = "Datos inválidos";
        detalles = Object.values(err.errors).map(val => val.message);
        mensaje = "Por favor, revisa los datos ingresados en el formulario:";
    }

    // 2. Error de clave duplicada (unique: true)
    else if (err.code === 11000) {
        statusCode = 400;
        titulo = "Registro duplicado";
        const campo = Object.keys(err.keyValue)[0];
        mensaje = `El valor ingresado para '${campo}' ya existe en el sistema.`;
    }

    // 3. Error de ID de MongoDB inválido (CastError)
    else if (err.name === 'CastError') {
        statusCode = 400;
        titulo = "Identificador no válido";
        mensaje = `El elemento solicitado con ID '${err.value}' no tiene un formato válido.`;
    }

    // Renderizar la vista pasando las variables a Pug
    res.status(statusCode).render("404", {
        titulo,
        mensaje,
        detalles: detalles.length > 0 ? detalles : null
    });
};

export default errorHandler;