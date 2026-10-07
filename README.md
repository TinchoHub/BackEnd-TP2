# AutoBox - Sistema de Gestión de Taller Mecánico (Trabajo Práctico Nº 1)

AutoBox es una aplicación web integral desarrollada con **Node.js** y **Express** bajo el patrón arquitectónico **MVC (Modelo-Vista-Controlador)**. Este repositorio contiene la resolución completa del trabajo práctico, estructurado mediante una solución híbrida: un frontend con renderizado del lado del servidor (SSR) usando plantillas **Pug** y una **API RESTful** en formato JSON.

---

## Mapeo de Consignas Académicas y Resoluciones

A continuación se detalla cómo se resolvieron los requerimientos técnicos y funcionales solicitados en las consignas del proyecto:

| Consignas / Requerimiento Académico | Resolución Implementada en el Proyecto | Archivos Asociados |
| :--- | :--- | :--- |
| **1. Arquitectura MVC** | Separación estricta de responsabilidades entre modelos de datos, controladores de negocio, enrutadores y vistas. | `models/`, `controllers/`, `routes/`, `views/` |
| **2. Persistencia de Datos** | Almacenamiento local mediante archivos planos en formato JSON utilizando el módulo nativo de Node.js (`fs`). | `data/clientes.json`, `data/turnos.json`, `data/vehiculos.json` |
| **3. Motor de Plantillas (SSR)** | Uso de **Pug** para la generación dinámica de la interfaz web, layouts reutilizables y paneles de control. | `views/layout.pug`, `views/index.pug`, `views/*.pug` |
| **4. Enrutamiento Modular** | Separación de rutas por entidad (clientes, vehículos, turnos) y enrutador específico para vistas web. | `routes/clientesRoutes.js`, `routes/turnosRoutes.js`, `routes/vehiculosRoutes.js`, `routes/vistas.js` |
| **5. Middleware** | `express.json()` para parsear el cuerpo de peticiones entrantes en formato JSON |
| **6. Manejo de Errores y 404** | Interceptores dedicados para rutas inexistentes (con respuesta dual JSON/HTML) y controlador global de excepciones (500). | `middlewares/notFoundMiddleware.js`, `middlewares/errorHandler.js` |

---

## Estructura del Directorio

```text
TP1/
├── app.js                          # Punto de entrada y configuración del servidor
├── package.json                    # Dependencias y scripts del proyecto
├── package-lock.json[cite: 3]
├── controllers/                    # Lógica de negocio y renderizado
│   ├── clientesController.js
│   ├── turnosController.js
│   ├── vehiculosController.js
│   └── vistasController.js
├── data/                           # Almacenamiento persistente en JSON
│   ├── clientes.json
│   ├── turnos.json
│   └── vehiculos.json
├── models/                         # Clases y estructuras de datos
│   ├── Cliente.js
│   ├── Turno.js
│   └── Vehiculo.js
├── public/                         # Recursos estáticos de acceso público
│   ├── css/styles.css
│   ├── img/ (404.png, autobox-logo.png, hero-auto.png)
│   └── js/main.js
├── routes/                         # Enrutadores modulares (Web y API)
│   ├── clientesRoutes.js
│   ├── turnosRoutes.js
│   ├── vehiculosRoutes.js
│   └── vistas.js
└── views/                          # Plantillas de vistas Pug
    ├── 404.pug
    ├── index.pug
    ├── layout.pug
    └── *.pug (vistas de detalle y formularios)
    ---

## Características Implementadas

1. **Programación Orientada a Objetos (POO):** Modelado estructurado a través de las clases `Cliente`, `Vehiculo` y `Turno` para instanciar objetos tipados antes de guardarlos en el sistema.
2. **Persistencia en JSON:** Lectura y escritura sincronizada y segura de archivos JSON, con validación de existencia previa mediante `fs.existsSync` y autoincremento dinámico de identificadores (`id`).
3. **Rutas Dinámicas:** Uso de parámetros de ruta (`/:id`) para realizar consultas, modificaciones y bajas puntuales sobre cada recurso.
4. **Middlewares:**
   * `express.json()` para parsear el cuerpo de peticiones entrantes en formato JSON.
5. **Motor de Plantillas Pug:** Renderizado dinámico con layout persistente (`sidebar`), tablas interactivas de datos y formularios para la gestión del taller mecánico.

---

## Endpoints de la API REST

**Módulo Clientes (/clientes o /api/clientes)**
* `GET /` - Listar todos los clientes.
* `GET /:id` - Consultar un cliente por su ID.
* `POST /` - Dar de alta un nuevo cliente (genera ID automático).
* `PUT /:id` - Modificar un cliente existente.
* `DELETE /:id` - Eliminar un cliente por su ID.

**Módulo Vehículos (/vehiculos o /api/vehiculos)**
* `GET /` - Listar todos los vehículos.
* `GET /:id` - Consultar un vehículo por su ID.
* `POST /` - Registrar un nuevo vehículo asociado a un clienteId.
* `PUT /:id` - Actualizar los datos de un vehículo.
* `DELETE /:id` - Eliminar un vehículo por su ID.

**Módulo Turnos (/turnos o /api/turnos)**
* `GET /` - Listar todos los turnos registrados.
* `GET /:id` - Consultar un turno puntual por su ID.
* `POST /` - Asignar un nuevo turno en el taller.
* `PUT /:id` - Modificar los datos o servicio de un turno.
* `DELETE /:id` - Cancelar o eliminar un turno por su ID.

---

## Instalación y Puesta en Marcha

1. Clonar el repositorio:
   git clone <URL_DEL_REPOSITORIO>

2. Ingresar a la carpeta del proyecto:
   cd TP1

3. Instalar las dependencias necesarias:
   npm install

4. Iniciar el servidor en modo desarrollo:
   npx nodemon app.js

5. Acceso al sistema:
   Abrir el navegador web e ingresar a: http://localhost:3000

---

## Integrantes y Roles del Proyecto

* **Dalila — Módulo Clientes:**
  * Creación de la clase `Cliente`.
  * Creación y administración del archivo `clientes.json`.
  * Implementación de la lógica del controlador para listar, consultar, agregar, modificar y eliminar clientes.
  * Ejecución de pruebas unitarias y de endpoints del módulo.

* **Jorge — Módulo Vehículos:**
  * Creación de la clase `Vehiculo`.
  * Creación y administración del archivo `vehiculos.json`.
  * Implementación de funciones para registrar, consultar, modificar y dar de baja vehículos.
  * Vinculación lógica de vehículos con su respectivo `clienteId`.
  * Pruebas y validación del módulo de vehículos.

* **Luis — Módulo Turnos:**
  * Creación de la clase `Turno`.
  * Creación y administración del archivo `turnos.json`.
  * Implementación de la lógica para registrar, consultar, actualizar y cancelar turnos del taller.
  * Relación e integridad de datos entre turnos, clientes y vehículos.
  * Pruebas del ciclo de vida del turno.

* **Martín — Express y Middleware:**
  * Configuración general de la arquitectura del servidor con Node.js y Express.
  * Configuración de rutas y vinculación de endpoints con sus controladores.
  * Configuración y estandarización del uso de rutas dinámicas (`/:id`).
  * Integración modular y resolución de consistencia entre los componentes del backend.

* **Martina — Vistas Pug e Integración:**
  * Construcción de la interfaz de usuario y vistas SSR utilizando el motor Pug.
  * Visualización y renderizado dinámico de los listados y detalles de clientes, vehículos y turnos.
  * Conexión fluida entre las vistas de usuario y las rutas/controladores del sistema.
  * Pruebas generales de navegación en el navegador web.
  * Captura, organización y documentación de evidencias visuales para la entrega.

---

## Bibliografía y Documentación Consultada

* Express.js - Documentación Oficial: https://expressjs.com/
* Node.js Documentation - Módulo File System (fs): https://nodejs.org/api/fs.html
* Pug Getting Started & Syntax Guide: https://pugjs.org/
* MDN Web Docs - Métodos HTTP y Códigos de Estado de Respuesta: https://developer.mozilla.org/es/docs/Web/HTTP