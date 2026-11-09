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
      required: [true, 'La fecha es obligatoria'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato AAAA-MM-DD']
    },
    hora: {
      type: String,
      required: [true, 'La hora es obligatoria'],
      trim: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'La hora debe tener formato HH:MM']
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
// Regla de reserva (RF-01 / RNF-01): un solo turno activo por fecha y hora.
// El índice es parcial: al cancelar un turno (activo:false) el horario vuelve a quedar libre.
// La exclusión la garantiza MongoDB, no el código, por lo que resiste requests simultáneos.
turnoSchema.index(
  { fecha: 1, hora: 1 },
  { unique: true, partialFilterExpression: { activo: true } }
);

export default mongoose.model('Turno', turnoSchema);