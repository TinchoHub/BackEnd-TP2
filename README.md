# AutoBox — Gestión de Turnos y Atención de Clientes (Versión 1.1)

Aplicación web para administrar **clientes, vehículos y turnos** de un taller mecánico multimarca. Está desarrollada con **Node.js, Express y Pug**, con arquitectura **MVC**, persistencia en **MongoDB (Mongoose)**, interfaz renderizada en el servidor (SSR) y una API REST que responde JSON.

> **Evolución:** en el TP1 los datos se guardaban en archivos JSON. En el TP2 se migró a MongoDB y en esta versión (1.1) se incorporaron autenticación con JWT, roles, usuarios, notificaciones en tiempo real y un asesor con IA.

## Tecnologías

- **Node.js** y **Express 5** (módulos ES).
- **MongoDB** y **Mongoose 9** (local o Atlas).
- **Pug** para las vistas SSR.
- **jsonwebtoken + cookie-parser + bcryptjs** para autenticación.
- **socket.io** para notificaciones en tiempo real.
- **@google/generative-ai (Gemini)** para el asesor técnico.
- **dotenv** para variables de entorno y **nodemon** (solo desarrollo).

## Decisiones técnicas (qué se usó y qué se reemplazó)

- **JWT en cookie `httpOnly` en lugar de `express-session`:** en el TP2 se usaron sesiones en memoria del servidor. Se reemplazaron por JWT porque no dependen del estado del servidor (facilitan el despliegue y el escalado) y permiten llevar el rol en el token. La cookie usa `httpOnly` (protege de XSS), `sameSite: 'lax'` (mitiga CSRF) y `secure` en producción. Las contraseñas se guardan con **bcrypt**.
- **Un único punto de verificación:** `app.js` valida el token en cada request y carga `req.usuario`. Los middlewares `protegerRuta` (vistas → redirige a `/login`), `protegerApi` (API → responde `401` en JSON) y `esAdmin` solo consultan ese resultado, sin repetir consultas a la base.
- **Borrado lógico en todas las entidades** (campo `activo`), incluidos los usuarios, para conservar la trazabilidad. Nunca se puede dejar el sistema sin un administrador activo.
- **Errores centralizados:** `errorHandler.js` devuelve JSON para rutas `/api` y una vista para las rutas web. En producción no expone el detalle de errores 500.

## Estructura del proyecto

```text
├── app.js                  # Servidor, middlewares globales, rutas y WebSockets
├── config/db.js            # Conexión con MongoDB
├── controllers/            # Lógica de aplicación (clientes, vehículos, turnos, usuarios, auth, vistas, IA)
├── middlewares/            # authMiddleware.js, errorHandler.js
├── models/                 # Cliente, Vehiculo, Turno, Usuario
├── routes/                 # Rutas API (/api/...) y rutas web
├── services/               # Integración con Gemini
├── prompts/asesor.txt      # Instrucciones del asesor técnico
├── scripts/seed.js         # Crea el primer administrador
├── views/  public/         # Plantillas Pug, CSS, JS cliente e imágenes
└── .env.example            # Plantilla de variables de entorno
```

## Variables de entorno

Copiar `.env.example` a `.env` y completar:

| Variable | Uso |
| --- | --- |
| `MONGODB_URI` | Conexión a MongoDB (local o Atlas) |
| `JWT_SECRET` | Clave para firmar los tokens |
| `GEMINI_API_KEY` | Clave de la API de Gemini (asesor con IA) |
| `GEMINI_MODEL` | Opcional: nombre del modelo de Gemini |
| `PORT`, `NODE_ENV` | Puerto y entorno (`production` activa cookies `secure`) |
| `SEED_ADMIN_USER`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME` | Datos del primer administrador (solo para `npm run seed`) |

## Instalación y ejecución

```bash
git clone https://github.com/TinchoHub/BackEnd-TP2.git
cd BackEnd-TP2
npm install
cp .env.example .env     # completar los valores
npm run seed             # crea el primer administrador (solo si no existe ninguno)
npm run dev              # desarrollo (o npm start)
```

Abrir `http://localhost:3000` e iniciar sesión con el administrador creado por el seed. Desde **Usuarios** el administrador puede dar de alta operadores.

## Roles y acceso

| Recurso | Sin sesión | Operador | Admin |
| --- | --- | --- | --- |
| Vistas web (`/`, `/clientes`, `/vehiculos`, `/turnos`, `/asistente`) | Redirige a `/login` | Sí | Sí |
| API REST (`/api/clientes`, `/api/vehiculos`, `/api/turnos`, `/api/ia`) | `401` JSON | Sí | Sí |
| Gestión de usuarios (`/usuarios`) | Redirige a `/login` | `403` | Sí |

## Endpoints REST (requieren sesión)

| Método | Clientes | Vehículos | Turnos |
| --- | --- | --- | --- |
| GET | `/api/clientes` | `/api/vehiculos` | `/api/turnos` |
| GET por ID | `/api/clientes/:id` | `/api/vehiculos/:id` | `/api/turnos/:id` |
| POST | `/api/clientes` | `/api/vehiculos` | `/api/turnos` |
| PUT | `/api/clientes/:id` | `/api/vehiculos/:id` | `/api/turnos/:id` |
| DELETE (baja lógica) | `/api/clientes/:id` | `/api/vehiculos/:id` | `/api/turnos/:id` |

Además: `POST /api/ia/consultar` (asesor técnico). Al crear o cancelar un turno el servidor emite por WebSocket los eventos `turno:creado` y `turno:cancelado`.

Reglas de integridad: no se elimina un cliente con vehículos activos, no se elimina un vehículo con turnos activos y el vehículo de un turno debe pertenecer al cliente indicado (también al modificar).

## Pruebas funcionales y evidencias

Durante la integración de las vistas se realizaron las siguientes comprobaciones manuales en el navegador, utilizando MongoDB local:

| Prueba | Resultado observado |
| --- | --- |
| Registro de un cliente | Registro y visualización correctos |
| Edición de datos de cliente | Actualización correcta |
| Registro de vehículo asociado a cliente | Registro y asociación correctos |
| Registro de turno asociado a cliente y vehículo | Registro y asociación correctos |
| Listado y detalle de turnos | Se visualizan cliente, vehículo, fecha, hora y servicio |
| Cancelación de turno | Operación completada correctamente |
| Intento de eliminar un vehículo con turnos asociados | El sistema impidió la eliminación |
| Listado y detalle de vehículos | Se visualizan los datos y el propietario asociado |

**Evidencias visuales recopiladas:** listado de turnos, detalle de turno, listado de clientes, listado de vehículos y detalle de vehículo. Las capturas deben incorporarse al repositorio en una carpeta de evidencias antes de enlazarlas desde este documento.

Estas son **pruebas manuales de integración**, no una afirmación de cobertura automatizada de todos los endpoints.

## Integrantes y responsabilidades

### Dalila — Módulo Clientes
- Desarrollo y mantenimiento del modelo Mongoose de Cliente.
- Operaciones de alta, consulta, modificación y baja de clientes.
- Validaciones y pruebas del módulo de clientes.

### Jorge — Módulo Vehículos
- Desarrollo y mantenimiento del modelo Mongoose de Vehículo.
- Operaciones de gestión de vehículos.
- Asociación de vehículos con clientes y verificaciones de integridad.

### Luis — Módulo Turnos
- Desarrollo y mantenimiento del modelo Mongoose de Turno (incluyendo borrado lógico mediante el campo `activo`).
- Operaciones de registro, consulta, actualización y cancelación de turnos.
- Relaciones entre turnos, clientes y vehículos mediante `ObjectId` y consultas con `.populate()`.
- Implementación de validaciones en el esquema (campos obligatorios de fecha/hora y mínimo de caracteres en servicio).

### Martín — Configuración e integración del servidor
- Configuración de Express y conexión con MongoDB.
- Integración de rutas, middleware y manejo de errores.
- Coordinación de la estructura modular del backend.

### Martina Bistagnino — Vistas Pug e Integración
- Adaptación de las vistas para mostrar datos de MongoDB y relaciones entre entidades.
- Actualización de `views/nuevoTurno.pug`, `views/turnoDetalle.pug`, `views/turnos.pug`, `views/vehiculoDetalle.pug` y `views/vehiculos.pug`.
- Corrección de indentación y estructura en plantillas Pug.
- Presentación abreviada de identificadores de MongoDB en listados.
- Pruebas manuales de navegación, registro, edición, cancelación y restricciones de eliminación.
- Recolección de capturas para documentar la integración.
- **Commit:** `e060941` — `feat: adaptar vistas Pug e integracion con MongoDB`.

## Documentación consultada

- [Node.js](https://nodejs.org/docs/latest/api/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/docs/)
- [Mongoose](https://mongoosejs.com/docs/)
- [Pug](https://pugjs.org/)
- [MDN Web Docs](https://developer.mozilla.org/es/docs/Web/HTTP)
