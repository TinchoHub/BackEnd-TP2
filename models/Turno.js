import mongoose from 'mongoose';
const turnoSchema = new mongoose.Schema(
  {
    clienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cliente',
      required: true
    },
    vehiculoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehiculo',
      required: true
    },
    fecha: {
      type: String,
      required: [true, 'La fecha es obligatoria']
    },
    hora: {
      type: String,
      required: [true, 'La hora es obligatoria'],
      trim: true
    },
    servicio: {
      type: String,
      required: [true, 'El servicio es obligatorio'],
      trim: true,
      minlength: [3, 'El servicio debe tener al menos 3 caracteres']
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
export default mongoose.model('Turno', turnoSchema);