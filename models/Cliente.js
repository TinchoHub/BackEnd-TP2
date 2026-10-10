import mongoose from 'mongoose';

const clienteSchema = new mongoose.Schema(
{
id: {
type: Number,
required: true,
unique: true
},
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
lowercase: true,
match: [
/^[^\s@]+@[^\s@]+.[^\s@]+$/,
'Ingresá un email válido'
]
}
},
{
timestamps: true,
id: false
}
);

const Cliente = mongoose.model('Cliente', clienteSchema);

export default Cliente;
