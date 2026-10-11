
import mongoose from 'mongoose';

const vehiculoSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
            required: true,
            unique: true
        },
        patente: {
            type: String,
            required: [true, 'La patente es obligatoria'],
            trim: true,
            uppercase: true
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
            type: Number,
            required: [true, 'El ID del cliente es obligatorio']
        }
    },
    {
        timestamps: true,
        id: false
    }
);

const Vehiculo = mongoose.model('Vehiculo', vehiculoSchema);

export default Vehiculo;