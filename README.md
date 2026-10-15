# AutoBox — Sistema de Gestión de Taller Mecánico (Trabajo Práctico N.º 2)

AutoBox es una aplicación web para administrar **clientes, vehículos y turnos** de un taller mecánico. Está desarrollada con **Node.js, Express y Pug**, siguiendo una organización **MVC (Modelo–Vista–Controlador)**. En el TP2 se incorporó **MongoDB mediante Mongoose** como persistencia principal, manteniendo una interfaz web renderizada en el servidor (SSR) y una API REST que devuelve JSON.

> **Evolución respecto del TP1:** el TP1 utilizaba archivos JSON. En el TP2 los modelos y las operaciones de persistencia trabajan con MongoDB y Mongoose. La carpeta `data/` todavía está presente en el repositorio como material heredado, pero no representa la persistencia principal del TP2.

---

## Requerimientos y resolución técnica

| Requerimiento | Implementación | Archivos |
| --- | --- | --- |
| Arquitectura modular MVC | Separación de modelos, controladores, rutas y vistas | `models/`, `controllers/`, `routes/`, `views/` |
| Base de datos | Conexión a MongoDB con Mongoose mediante `MONGODB_URI` | `config/db.js`, `models/` |
| Modelado y relaciones | Esquemas de Cliente, Vehículo y Turno; referencias `ObjectId` y consultas con `populate()` | `models/`, `controllers/` |
| Operaciones CRUD | Endpoints REST por entidad y formularios web para operaciones implementadas | `routes/`, `controllers/` |
| Vistas dinámicas | Plantillas Pug para listados, formularios y detalles | `views/` |
| Middleware | Parseo JSON y formularios, sesiones, autenticación de vistas y manejo centralizado de errores | `app.js`, `middlewares/` |
| Errores y rutas inexistentes | Middleware de errores y página 404 para rutas no encontradas | `middlewares/errorHandler.js`, `views/404.pug`, `app.js` |

## Tecnologías

- **Node.js** y **Express 5** para el servidor y las rutas.
- **MongoDB** y **Mongoose 9** para persistencia, esquemas y relaciones.
- **Pug 3** para renderizado SSR.
- **express-session** para sesiones y middleware de autenticación de las vistas.
- **dotenv** para leer variables de entorno.
- **nodemon** para desarrollo.

El proyecto utiliza módulos ECMAScript (`"type": "module"`). Las versiones concretas instaladas se determinan mediante `package-lock.json`.

## Estructura del proyecto

```text
BackEnd-TP2/
├── app.js                    # Configuración e inicio del servidor
├── config/
│   └── db.js                 # Conexión con MongoDB
├── controllers/
│   ├── clientesController.js
│   ├── vehiculosController.js
│   ├── turnosController.js
│   └── vistasController.js
├── models/
│   ├── Cliente.js
│   ├── Vehiculo.js
│   └── Turno.js
├── routes/
│   ├── clientesRoutes.js
│   ├── vehiculosRoutes.js
│   ├── turnosRoutes.js
│   └── vistas.js
├── middlewares/
│   ├── auth.js
│   └── errorHandler.js
├── views/                    # Listados, formularios, detalles y login en Pug
├── public/                   # CSS, JavaScript e imágenes
├── data/                     # Archivos JSON heredados del TP1
├── package.json
└── README.md
```
## Modelos y relaciones

* **Cliente:** nombre, apellido, teléfono, email y estado `activo`.
* **Vehículo:** patente, marca, modelo, estado `activo` y `clienteId` (referencia a `Cliente`).
* **Turno:** `clienteId` (referencia a `Cliente`), `vehiculoId` (referencia a `Vehiculo`), fecha, hora, servicio y estado `activo`
*  para implementar borrado lógico (`soft delete`).

Los tres esquemas incluyen marcas de tiempo (`timestamps`). MongoDB genera identificadores de tipo `ObjectId`. Las vistas y las respuestas de la API recuperan las entidades relacionadas mediante consultas que ejecutan `.populate()` sobre las referencias correspondientes (`clienteId` y `vehiculoId`).

## Endpoints REST

Los siguientes endpoints se encuentran definidos en los archivos de rutas y se montan bajo el prefijo `/api`.

| Método | Clientes | Vehículos | Turnos |
| --- | --- | --- | --- |
| GET | `/api/clientes` | `/api/vehiculos` | `/api/turnos` |
| GET por ID | `/api/clientes/:id` | `/api/vehiculos/:id` | `/api/turnos/:id` |
| POST | `/api/clientes` | `/api/vehiculos` | `/api/turnos` |
| PUT | `/api/clientes/:id` | `/api/vehiculos/:id` | `/api/turnos/:id` |
| DELETE | `/api/clientes/:id` | `/api/vehiculos/:id` | `/api/turnos/:id` |

La aplicación también dispone de rutas web para inicio de sesión, inicio, clientes, vehículos y turnos, con formularios y pantallas de detalle. **Las rutas web y las rutas API no son equivalentes:** las primeras renderizan Pug y las segundas exponen operaciones REST.

## Instalación y ejecución

**Requisitos:** Node.js y una instancia de MongoDB accesible, por ejemplo MongoDB Community Server local.

1. Clonar el repositorio y entrar a la carpeta:

   ```bash
   git clone https://github.com/TinchoHub/BackEnd-TP2.git
   cd BackEnd-TP2
   ```

2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Crear un archivo `.env` en la raíz del proyecto, con valores apropiados para el entorno:

   ```dotenv
   MONGODB_URI=mongodb://127.0.0.1:27017/autobox
   SESSION_SECRET=reemplazar-por-una-clave-privada-segura
   PORT=3000
   ```

   La base de datos y el puerto mostrados son **valores de ejemplo**. No subir `.env` ni credenciales privadas al repositorio.

4. Asegurarse de que MongoDB esté ejecutándose y levantar la aplicación:

   ```bash
   npm run dev
   ```

   Alternativamente, usar `npm start` para ejecutar `node app.js`.

5. Abrir `http://localhost:3000` en el navegador. La interfaz dispone de inicio de sesión de prueba definido en `routes/vistas.js`; **no es un sistema de autenticación preparado para producción**.

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
