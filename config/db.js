
import mongoose from 'mongoose';

// Función para conectar con MongoDB
const conectarDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;

        const conn = await mongoose.connect(uri);

        console.log(
            `MongoDB Conectado: ${conn.connection.host}/${conn.connection.name}`
        );
    } catch (error) {
        console.error(`Error al conectar con MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default conectarDB;