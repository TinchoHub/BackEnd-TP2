class Turno {
    constructor(id, clienteId, vehiculoId, fecha, hora, servicio) {
        this.id = id;
        this.clienteId = clienteId;
        this.vehiculoId = vehiculoId;
        this.fecha = fecha;
        this.hora = hora;
        this.servicio = servicio;
    }
}

module.exports = Turno;