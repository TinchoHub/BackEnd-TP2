import mongoose from 'mongoose';
const clienteSchema = new mongoose.Schema(
    {        
        nombre: {
            type: String,
            required: [true, 'El nombre es obligatorio'],
            trim: true
        },
        apellido: {
            type: String,
            required: [true, 'El apellido es obligatorio'],
            trim: true
        },
        telefono: {
            type: String,
            required: [true, 'El teléfono es obligatorio'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'El email es obligatorio'],
            trim: true,
            unique: true,
            lowercase: true,
            match: [
                /^[^\s@]+@[^\s@]+.[^\s@]+$/,
                'Ingresá un email válido'
            ]
        },
        // CAMPO DE ESTADO / SOFT DELETE:
        activo: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);
export default mongoose.model('Cliente', clienteSchema);