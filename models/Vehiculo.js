import mongoose from 'mongoose';
const vehiculoSchema = new mongoose.Schema(
    {       
        patente: {
            type: String,
            required: [true, 'La patente es obligatoria'],
            trim: true,
            uppercase: true,
            unique: true
        },
        marca: {
            type: String,
            required: [true, 'La marca es obligatoria'],
            trim: true
        },
        modelo: {
            type: String,
            required: [true, 'El modelo es obligatorio'],
            trim: true
        },
        clienteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cliente',
            required: [true, 'El ID del cliente es obligatorio']
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
export default mongoose.model('Vehiculo', vehiculoSchema);