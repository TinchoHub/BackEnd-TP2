import mongoose from 'mongoose';

// Promesa de conexión reutilizable: en un entorno serverless (Vercel) cada request
// puede ejecutarse en una instancia ya iniciada, y se evita abrir una conexión nueva cada vez.
let conexion = null;

const conectarDB = async () => {
    if (mongoose.connection.readyState === 1) return mongoose.connection;

    if (!conexion) {
        conexion = mongoose.connect(process.env.MONGODB_URI).then((conn) => {
            console.log(`MongoDB Conectado: ${conn.connection.host}/${conn.connection.name}`);
            return conn.connection;
        }).catch((error) => {
            conexion = null; // permite reintentar en la próxima request
            throw new Error(`Error al conectar con MongoDB: ${error.message}`);
        });
    }
    return conexion;
};

export default conectarDB;
