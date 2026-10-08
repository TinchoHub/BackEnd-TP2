import mongoose from 'mongoose';

export const conectarDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Conectado: ${conn.connection.host}/${conn.connection.name}`);
    } catch (error) {
        console.error(`Error al conectar con MongoDB: ${error.message}`);
        process.exit(1);
    }
};