import mongoose from 'mongoose';

const turnoSchema = new mongoose.Schema(
  {
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cliente',
      required: [true, 'El cliente es obligatorio']
    },
    vehiculo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehiculo',
      required: [true, 'El vehículo es obligatorio']
    },
    fecha: {
      type: Date,
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
