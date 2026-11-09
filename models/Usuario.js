import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const usuarioSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'El nombre de usuario es obligatorio'],
            unique: true,
            trim: true,
            lowercase: true,
            minlength: [3, 'El usuario debe tener al menos 3 caracteres']
        },
        password: {
            type: String,
            required: [true, 'La contraseña es obligatoria'],
            minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
        },
        nombre: {
            type: String,
            required: [true, 'El nombre es obligatorio'],
            trim: true
        },
        rol: {
            type: String,
            enum: ['admin', 'operador'],
            default: 'admin'
        },
        activo: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// Middleware pre-save: Hashear la contraseña antes de guardar si fue modificada
usuarioSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);        
});

// Método personalizado para comparar contraseñas en el login
usuarioSchema.methods.compararPassword = async function (passwordIngresada) {
    return await bcrypt.compare(passwordIngresada, this.password);
};

export default mongoose.model('Usuario', usuarioSchema);