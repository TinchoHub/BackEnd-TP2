# Diagramas de AutoBox (Versión 1.1)

Los diagramas están escritos en [Mermaid](https://mermaid.js.org/): GitHub los muestra renderizados en este archivo. Para el documento PDF hay una imagen PNG de cada uno en `docs/img/`, y el código fuente editable en `docs/diagramas/`.

## Diagrama de casos de uso

Actores y funcionalidades implementadas. Entre paréntesis, el requerimiento del documento de Ingeniería de Software que cubre cada una. El administrador hereda todo lo del operador y suma la gestión de usuarios.

```mermaid
flowchart LR
    AD(["Administrador"])
    OP(["Operador<br/>(Recepción)"])

    subgraph SIS["Sistema AutoBox / TurnoFlex"]
        CU1(["Iniciar y cerrar sesión"])
        CU2(["Gestionar clientes<br/>(baja bloqueada si tiene vehículos activos)"])
        CU3(["Gestionar vehículos<br/>(baja bloqueada si tiene turnos activos)"])
        CU4(["Agendar turno (RF-01)"])
        CU5(["Consultar turnos"])
        CU6(["Cancelar turno (RF-03)"])
        CU7(["Ver turnos nuevos y cancelados<br/>en tiempo real (RF-04, solo en local)"])
        CU8(["Consultar asesor técnico con IA"])
        CU9(["Gestionar usuarios y roles"])
        V1(["Validar horario libre y<br/>pertenencia vehículo-cliente"])
    end

    OP --- CU1
    OP --- CU2
    OP --- CU3
    OP --- CU4
    OP --- CU5
    OP --- CU6
    OP --- CU7
    OP --- CU8
    AD --- CU9
    AD -. "hereda los casos de uso del operador" .-> OP
    CU4 -. "«include»" .-> V1
```

Imagen para el PDF: `docs/img/01-casos-de-uso.png`

## Diagrama de clases (modelos)

Los cuatro modelos de Mongoose. Las asociaciones se implementan con referencias `ObjectId` y se consultan con `.populate()`.

```mermaid
classDiagram
    direction LR
    class Cliente {
        +ObjectId _id
        +String nombre
        +String apellido
        +String telefono
        +String email  «único»
        +Boolean activo
        +Date createdAt
        +Date updatedAt
    }
    class Vehiculo {
        +ObjectId _id
        +String patente  «única, mayúsculas»
        +String marca
        +String modelo
        +ObjectId clienteId
        +Boolean activo
    }
    class Turno {
        +ObjectId _id
        +ObjectId clienteId
        +ObjectId vehiculoId
        +String fecha  «AAAA-MM-DD»
        +String hora  «HH:MM»
        +String servicio
        +Boolean activo
    }
    class Usuario {
        +ObjectId _id
        +String username  «único»
        +String password  «hash bcrypt»
        +String nombre
        +String rol  «admin | operador»
        +Boolean activo
        +compararPassword(passwordIngresada) Boolean
    }
    Cliente "1" --> "0..*" Vehiculo : posee
    Cliente "1" --> "0..*" Turno : solicita
    Vehiculo "1" --> "0..*" Turno : se atiende en
```

Imagen para el PDF: `docs/img/02-clases.png`

## Modelo entidad-relación

Colecciones de MongoDB. `PK` clave primaria, `FK` referencia a otra colección, `UK` índice único. Turno tiene además un índice único parcial (`fecha` + `hora`) que solo rige para turnos activos.

```mermaid
erDiagram
    CLIENTE ||--o{ VEHICULO : posee
    CLIENTE ||--o{ TURNO : solicita
    VEHICULO ||--o{ TURNO : "se atiende en"

    CLIENTE {
        ObjectId _id PK
        string nombre
        string apellido
        string telefono
        string email UK
        boolean activo
        date createdAt
        date updatedAt
    }
    VEHICULO {
        ObjectId _id PK
        string patente UK
        string marca
        string modelo
        ObjectId clienteId FK
        boolean activo
        date createdAt
        date updatedAt
    }
    TURNO {
        ObjectId _id PK
        ObjectId clienteId FK
        ObjectId vehiculoId FK
        string fecha "AAAA-MM-DD"
        string hora "HH:MM"
        string servicio
        boolean activo "indice unico fecha+hora si activo"
        date createdAt
        date updatedAt
    }
    USUARIO {
        ObjectId _id PK
        string username UK
        string password "hash bcrypt"
        string nombre
        string rol "admin u operador"
        boolean activo
        date createdAt
        date updatedAt
    }
```

Imagen para el PDF: `docs/img/03-er.png`

## Diagrama de secuencia: inicio de sesión y verificación del JWT

Autenticación con JWT en cookie `httpOnly`. `app.js` verifica el token en cada request y deja el resultado en `req.usuario`.

```mermaid
sequenceDiagram
    actor U as Usuario
    participant N as Navegador
    participant S as Express (authController)
    participant DB as MongoDB

    U->>N: Ingresa usuario y contraseña
    N->>S: POST /login
    S->>DB: Busca usuario activo por username
    DB-->>S: Usuario (o nada)
    alt Usuario inexistente o contraseña incorrecta
        S-->>N: 401 y vista de login con error
    else Credenciales válidas (bcrypt.compare)
        S->>S: Firma JWT con id, username y rol (2 h)
        S-->>N: 302 a / y cookie token (httpOnly, sameSite lax)
    end

    Note over N,S: En cada request posterior
    N->>S: GET /clientes (con cookie)
    S->>S: app.js verifica el JWT y carga req.usuario
    alt Sin usuario válido
        S-->>N: Vistas: redirige a /login. API: 401 JSON
    else Con usuario válido
        S-->>N: Respuesta solicitada
    end
```

Imagen para el PDF: `docs/img/04-secuencia-login.png`

## Diagrama de secuencia: reserva de un turno

Incluye las validaciones de integridad y la regla de horario ocupado (`409 Conflict`).

```mermaid
sequenceDiagram
    actor O as Operador
    participant N as Navegador
    participant A as API /api/turnos
    participant C as turnosController
    participant DB as MongoDB

    O->>N: Completa cliente, vehículo, fecha, hora y servicio
    N->>A: POST /api/turnos
    A->>A: protegerApi verifica la sesión
    A->>C: crearTurno
    C->>DB: Cliente activo existe?
    C->>DB: Vehículo activo existe?
    C->>C: El vehículo pertenece al cliente?
    alt Cliente o vehículo inválido, o no coinciden
        C-->>N: 400 con mensaje
    else Datos válidos
        C->>DB: Turno.create (valida formato e índice único fecha+hora)
        alt Horario ya ocupado por un turno activo
            DB-->>C: Error 11000 (clave duplicada)
            C-->>N: 409 Conflict
        else Horario libre
            DB-->>C: Turno creado
            C-->>N: 201 Turno creado
        end
    end
```

Imagen para el PDF: `docs/img/05-secuencia-reserva.png`

## Diagrama de secuencia: cancelación de un turno

Baja lógica y notificación en tiempo real. El paso por WebSocket solo funciona en entornos con servidor persistente (local); en Vercel está deshabilitado.

```mermaid
sequenceDiagram
    actor O as Operador
    participant N as Navegador
    participant C as turnosController
    participant DB as MongoDB
    participant WS as Socket.io
    participant R as Otros navegadores conectados

    O->>N: Cancela un turno
    N->>C: DELETE /api/turnos/:id
    C->>DB: Actualiza activo=false (baja lógica)
    DB-->>C: Turno actualizado
    C-->>N: 200 Turno cancelado
    opt Entorno con servidor persistente (local)
        C->>WS: emit turno:cancelado
        WS-->>R: Evento en tiempo real
        R->>R: Actualiza la tabla sin recargar
    end
    Note over DB: El horario queda libre: el índice único solo aplica a turnos activos
```

Imagen para el PDF: `docs/img/06-secuencia-cancelacion.png`

