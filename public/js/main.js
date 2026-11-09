// ==========================================
// CONEXIÓN EN TIEMPO REAL (WEBSOCKETS)
// ==========================================
const socket = typeof io !== 'undefined' ? io() : null;

if (socket) {
    socket.on("connect", () => {
        console.log("Conectado al servidor de WebSockets:", socket.id);
    });

    // Escuchar evento de turno creado
    socket.on("turno:creado", (datos) => {
        const servicioNom = datos.turno?.servicio || "Servicio";
        mostrarToast(`📅 ${datos.mensaje}: ${servicioNom}`);

        const tablaBody = document.querySelector("#tablaTurnos tbody");
        if (tablaBody && datos.turno) {
            const idCorto = datos.turno._id ? datos.turno._id.slice(-6) : "---";
            const clienteNom = datos.turno.clienteId 
                ? `${datos.turno.clienteId.nombre} ${datos.turno.clienteId.apellido}` 
                : "Cliente no disponible";
            const vehiculoNom = datos.turno.vehiculoId 
                ? `${datos.turno.vehiculoId.patente} - ${datos.turno.vehiculoId.marca} ${datos.turno.vehiculoId.modelo || ''}` 
                : "Vehículo no disponible";

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><span class="id-badge">${idCorto}</span></td>
                <td>${clienteNom}</td>
                <td>${vehiculoNom}</td>
                <td><strong>${datos.turno.fecha}</strong></td>
                <td>${datos.turno.hora}</td>
                <td>${datos.turno.servicio}</td>
                <td><a class="action-link" href="/turnos/${datos.turno._id}">Ver detalle →</a></td>
            `;
            tablaBody.prepend(tr);
        }
    });

    // Escuchar evento de turno cancelado
    socket.on("turno:cancelado", (datos) => {
        mostrarToast(`❌ ${datos.mensaje}`);
        const tablaBody = document.querySelector("#tablaTurnos tbody");
        if (tablaBody) {
            setTimeout(() => {
                window.location.reload();
            }, 1200);
        }
    });
}

function mostrarToast(mensaje) {
    const toast = document.createElement("div");
    toast.className = "socket-toast";
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

// ==========================================
// LÓGICA PRINCIPAL (DOM READY)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {

    // 1. Menú lateral activo según la URL
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
    });

    // 2. Control del Widget Flotante de IA
    const btnToggleChatIA = document.getElementById("btnToggleChatIA");
    const btnCerrarChatIA = document.getElementById("btnCerrarChatIA");
    const ventanaChatIA = document.getElementById("ventanaChatIA");
    const formChatIA = document.getElementById("formChatIA");
    const inputPreguntaIA = document.getElementById("inputPreguntaIA");
    const chatBox = document.getElementById("chatBox");
    const btnEnviarIA = document.getElementById("btnEnviarIA");

    if (btnToggleChatIA && ventanaChatIA) {
        const toggleChat = (e) => {
            if (e) e.stopPropagation();
            const oculto = ventanaChatIA.classList.toggle("ia-hidden");
            btnToggleChatIA.classList.toggle("is-active", !oculto);

            if (!oculto && inputPreguntaIA) {
                setTimeout(() => inputPreguntaIA.focus(), 150);
            }
        };

        btnToggleChatIA.onclick = toggleChat;

        if (btnCerrarChatIA) {
            btnCerrarChatIA.onclick = toggleChat;
        }
    }

    // 3. Envío y procesamiento de preguntas de IA
    if (formChatIA && inputPreguntaIA && chatBox) {
        const agregarMensaje = (texto, tipo) => {
            const msgDiv = document.createElement("div");
            msgDiv.className = `chat-msg chat-msg--${tipo}`;
            const bubbleDiv = document.createElement("div");
            bubbleDiv.className = "chat-msg__bubble";
            bubbleDiv.innerHTML = texto.replace(/\n/g, "<br>");
            msgDiv.appendChild(bubbleDiv);
            chatBox.appendChild(msgDiv);
            chatBox.scrollTop = chatBox.scrollHeight;
            return msgDiv;
        };

        formChatIA.onsubmit = async (e) => {
            e.preventDefault();
            const mensaje = inputPreguntaIA.value.trim();
            if (!mensaje) return;

            agregarMensaje(mensaje, "user");
            inputPreguntaIA.value = "";
            inputPreguntaIA.disabled = true;
            if (btnEnviarIA) btnEnviarIA.disabled = true;

            const indicadorCarga = agregarMensaje("Analizando consulta con el taller...", "loading");

            try {
                const res = await fetch("/api/ia/consultar", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ mensaje })
                });

                const data = await res.json();
                indicadorCarga.remove();

                if (res.ok && data.respuesta) {
                    agregarMensaje(data.respuesta, "bot");
                } else {
                    agregarMensaje(data.error || "No se pudo obtener respuesta del asesor.", "bot");
                }
            } catch (error) {
                indicadorCarga.remove();
                agregarMensaje("Error al conectar con el servidor.", "bot");
            } finally {
                inputPreguntaIA.disabled = false;
                if (btnEnviarIA) btnEnviarIA.disabled = false;
                inputPreguntaIA.focus();
            }
        };
    }

    // 4. Filtrar vehículos dinámicamente según el cliente seleccionado
    const clienteSelect = document.querySelector("#clienteId");
    const vehiculoSelect = document.querySelector("#vehiculoId");

    if (clienteSelect && vehiculoSelect) {
        const opcionesVehiculos = Array.from(
            vehiculoSelect.querySelectorAll("option[data-cliente-id]")
        );

        opcionesVehiculos.forEach(opcion => {
            opcion.hidden = true;
            opcion.disabled = true;
        });

        clienteSelect.addEventListener("change", () => {
            const clienteSeleccionado = clienteSelect.value;

            vehiculoSelect.innerHTML =
                '<option value="" selected disabled>Seleccione un vehículo</option>';

            const vehiculosDelCliente = opcionesVehiculos.filter(
                opcion => opcion.dataset.clienteId === clienteSeleccionado
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
                vehiculoSelect.appendChild(nuevaOpcion);
            });

            vehiculoSelect.disabled = false;
        });
    }

    // 5. Efecto interactivo en tarjetas
    const cards = document.querySelectorAll(".accion-card, .stat-card");
    cards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
        });
    });

    // 6. Animación de contadores numéricos
    const contadores = document.querySelectorAll(".stat-numero");
    contadores.forEach(contador => {
        const objetivo = Number(contador.textContent);
        if (Number.isNaN(objetivo)) return;

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

    // 7. Buscador interactivo en tablas
    const buscadores = document.querySelectorAll("[data-table-search]");
    buscadores.forEach(buscador => {
        const tablaId = buscador.dataset.tableSearch;
        const filas = document.querySelectorAll(`#${tablaId} tbody tr`);

        buscador.addEventListener("input", () => {
            const busqueda = buscador.value.toLowerCase().trim();
            filas.forEach(fila => {
                const contenido = fila.textContent.toLowerCase();
                fila.style.display = contenido.includes(busqueda) ? "" : "none";
            });
        });
    });

});

// ==========================================
// FUNCIONES GLOBALES PARA ELIMINACIÓN ASÍNCRONA
// ==========================================
async function cancelarTurno(id) {
    if (!id || id === 'undefined') {
        alert("Error: Identificador de turno no válido");
        return;
    }

    const confirmar = confirm("¿Seguro que querés cancelar este turno?");
    if (!confirmar) return;

    try {
        const respuesta = await fetch(`/api/turnos/${id}`, {
            method: "DELETE"
        });
        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            alert(resultado.mensaje || "No se pudo cancelar el turno");
            return;
        }

        alert("Turno cancelado correctamente");
        window.location.href = "/turnos";
    } catch (error) {
        console.error("Error al cancelar el turno:", error);
        alert("Ocurrió un error al cancelar el turno");
    }
}

async function eliminarVehiculo(id) {
    if (!id || id === 'undefined') {
        alert("Error: Identificador de vehículo no válido");
        return;
    }

    const confirmar = confirm("¿Seguro que querés eliminar este vehículo?");
    if (!confirmar) return;

    try {
        const respuesta = await fetch(`/api/vehiculos/${id}`, {
            method: "DELETE"
        });
        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            alert(resultado.mensaje || "No se pudo eliminar el vehículo");
            return;
        }

        alert("Vehículo eliminado correctamente");
        window.location.href = "/vehiculos";
    } catch (error) {
        console.error("Error al eliminar el vehículo:", error);
        alert("Ocurrió un error al eliminar el vehículo");
    }
}

async function eliminarCliente(id) {
    if (!id || id === 'undefined') {
        alert("Error: Identificador de cliente no válido");
        return;
    }

    const confirmar = confirm("¿Seguro que querés eliminar este cliente?");
    if (!confirmar) return;

    try {
        const respuesta = await fetch(`/api/clientes/${id}`, {
            method: "DELETE"
        });
        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            alert(resultado.mensaje || "No se pudo eliminar el cliente");
            return;
        }

        alert("Cliente eliminado correctamente");
        window.location.href = "/clientes";
    } catch (error) {
        console.error("Error al eliminar el cliente:", error);
        alert("Ocurrió un error al eliminar el cliente");
    }
}