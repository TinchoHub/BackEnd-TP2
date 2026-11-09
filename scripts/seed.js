// Crea el primer administrador si todavía no existe ninguno.
// Uso: npm run seed   (requiere SEED_ADMIN_USER y SEED_ADMIN_PASSWORD en .env)
import 'dotenv/config';
import mongoose from 'mongoose';
import Usuario from '../models/Usuario.js';

const { MONGODB_URI, SEED_ADMIN_USER, SEED_ADMIN_PASSWORD, SEED_ADMIN_NAME } = process.env;

const ejecutarSeed = async () => {
    if (!MONGODB_URI || !SEED_ADMIN_USER || !SEED_ADMIN_PASSWORD) {
        console.error('Faltan MONGODB_URI, SEED_ADMIN_USER o SEED_ADMIN_PASSWORD en el .env');
        process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);

    const hayAdmin = await Usuario.exists({ rol: 'admin', activo: true });
    if (hayAdmin) {
        console.log('Ya existe un administrador activo: no se realizaron cambios.');
    } else {
        // El hash de la contraseña lo genera el pre-save del modelo Usuario
        await Usuario.create({
            username: SEED_ADMIN_USER,
            password: SEED_ADMIN_PASSWORD,
            nombre: SEED_ADMIN_NAME || 'Administrador',
            rol: 'admin'
        });
        console.log(`Administrador "${SEED_ADMIN_USER.toLowerCase()}" creado correctamente.`);
    }

    await mongoose.disconnect();
};

ejecutarSeed().catch((error) => {
    console.error('Error en el seed:', error.message);
    process.exit(1);
});
