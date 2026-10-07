class Vehiculo {
    constructor(id, patente, marca, modelo, clienteId) {
        this.id = id;
        this.patente = patente;
        this.marca = marca;
        this.modelo = modelo;
        this.clienteId = clienteId;
    }
}

module.exports = Vehiculo;