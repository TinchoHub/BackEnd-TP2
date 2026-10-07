document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // MENÚ ACTIVO SEGÚN LA URL
    // ==========================================

    const enlaces = document.querySelectorAll(".sidebar__nav a");
    const rutaActual = window.location.pathname;

    enlaces.forEach(enlace => {

        const rutaEnlace = enlace.getAttribute("href");

        enlace.classList.remove("active");

        if (
            rutaEnlace === rutaActual ||
            (rutaEnlace !== "/" && rutaActual.startsWith(rutaEnlace))
        ) {
            enlace.classList.add("active");
        }
            // ==========================================
    // FILTRAR VEHÍCULOS SEGÚN CLIENTE
    // ==========================================

    const clienteSelect = document.querySelector("#clienteId");
    const vehiculoSelect = document.querySelector("#vehiculoId");

    if (clienteSelect && vehiculoSelect) {

        const opcionesVehiculos = Array.from(
            vehiculoSelect.querySelectorAll(
                "option[data-cliente-id]"
            )
        );

        // Al cargar la página, ocultar todos los vehículos
        opcionesVehiculos.forEach(opcion => {
            opcion.hidden = true;
            opcion.disabled = true;
        });

        clienteSelect.addEventListener("change", () => {

            const clienteSeleccionado = clienteSelect.value;

            // Resetear el selector de vehículo
            vehiculoSelect.innerHTML =
                '<option value="" selected disabled>Seleccione un vehículo</option>';

            const vehiculosDelCliente =
                opcionesVehiculos.filter(
                    opcion =>
                        opcion.dataset.clienteId ===
                        clienteSeleccionado
                );

            if (vehiculosDelCliente.length === 0) {

                vehiculoSelect.innerHTML =
                    '<option value="" selected disabled>Este cliente no tiene vehículos registrados</option>';

                vehiculoSelect.disabled = true;

                return;
            }

            vehiculosDelCliente.forEach(opcion => {

                const nuevaOpcion = opcion.cloneNode(true);

                nuevaOpcion.hidden = false;
                nuevaOpcion.disabled = false;

                vehiculoSelect.appendChild(
                    nuevaOpcion
                );

            });

            vehiculoSelect.disabled = false;

        });

    }
    });


    // ==========================================
    // EFECTO SUAVE EN LAS CARDS
    // ==========================================

    const cards = document.querySelectorAll(
        ".accion-card, .stat-card"
    );

    cards.forEach(card => {

        card.addEventListener("mousemove", (e) => {

            const rect = card.getBoundingClientRect();

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);

        });

    });


    // ==========================================
    // ANIMACIÓN DE CONTADORES
    // ==========================================

    const contadores = document.querySelectorAll(".stat-numero");

    contadores.forEach(contador => {

        const objetivo = Number(contador.textContent);

        if (Number.isNaN(objetivo)) {
            return;
        }

        let actual = 0;

        const duracion = 700;
        const pasos = 30;
        const incremento = objetivo / pasos;

        const intervalo = setInterval(() => {

            actual += incremento;

            if (actual >= objetivo) {

                contador.textContent = objetivo;

                clearInterval(intervalo);

                return;
            }

            contador.textContent = Math.floor(actual);

        }, duracion / pasos);

    });


    // ==========================================
    // BUSCADOR GENÉRICO DE TABLAS
    // ==========================================

    const buscadores = document.querySelectorAll(
        "[data-table-search]"
    );

    buscadores.forEach(buscador => {

        const tablaId = buscador.dataset.tableSearch;

        const filas = document.querySelectorAll(
            `#${tablaId} tbody tr`
        );

        buscador.addEventListener("input", () => {

            const busqueda = buscador.value
                .toLowerCase()
                .trim();

            filas.forEach(fila => {

                const contenido =
                    fila.textContent.toLowerCase();

                fila.style.display =
                    contenido.includes(busqueda)
                        ? ""
                        : "none";

            });

        });

    });

});


// ==========================================
// CANCELAR TURNO
// ==========================================

async function cancelarTurno(id) {

    const confirmar = confirm(
        "¿Seguro que querés cancelar este turno?"
    );

    if (!confirmar) {
        return;
    }

    try {

        const respuesta = await fetch(
            `/api/turnos/${id}`,
            {
                method: "DELETE"
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok) {

            alert(
                resultado.mensaje ||
                "No se pudo cancelar el turno"
            );

            return;
        }

        alert("Turno cancelado correctamente");

        window.location.href = "/turnos";

    } catch (error) {

        console.error(
            "Error al cancelar el turno:",
            error
        );

        alert(
            "Ocurrió un error al cancelar el turno"
        );

    }

}
// ==========================================
// ELIMINAR VEHÍCULO
// ==========================================

async function eliminarVehiculo(id) {

    const confirmar = confirm(
        "¿Seguro que querés eliminar este vehículo?"
    );

    if (!confirmar) {
        return;
    }

    try {

        const respuesta = await fetch(
            `/api/vehiculos/${id}`,
            {
                method: "DELETE"
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok) {

            alert(
                resultado.mensaje ||
                "No se pudo eliminar el vehículo"
            );

            return;
        }

        alert("Vehículo eliminado correctamente");

        window.location.href = "/vehiculos";

    } catch (error) {

        console.error(
            "Error al eliminar el vehículo:",
            error
        );

        alert(
            "Ocurrió un error al eliminar el vehículo"
        );

    }

}
// ==========================================
// ELIMINAR CLIENTE
// ==========================================

async function eliminarCliente(id) {

    const confirmar = confirm(
        "¿Seguro que querés eliminar este cliente?"
    );

    if (!confirmar) {
        return;
    }

    try {

        const respuesta = await fetch(
            `/api/clientes/${id}`,
            {
                method: "DELETE"
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok) {

            alert(
                resultado.mensaje ||
                "No se pudo eliminar el cliente"
            );

            return;
        }

        alert("Cliente eliminado correctamente");

        window.location.href = "/clientes";

    } catch (error) {

        console.error(
            "Error al eliminar el cliente:",
            error
        );

        alert(
            "Ocurrió un error al eliminar el cliente"
        );

    }

}