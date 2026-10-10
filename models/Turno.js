import mongoose from 'mongoose';

const turnoSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true
    },
    clienteId: {
      type: Number,
      required: true
    },
    vehiculoId: {
      type: Number,
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
      trim: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const Turno = mongoose.model('Turno', turnoSchema);

export default Turno;