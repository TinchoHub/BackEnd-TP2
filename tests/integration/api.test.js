// Pruebas de integración contra una base de datos DE PRUEBA.
// Requiere la variable MONGODB_URI_TEST (local o un cluster de prueba en Atlas).
// Por seguridad solo corren si el nombre de la base contiene "test": al terminar se la elimina.
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

const uri = process.env.MONGODB_URI_TEST;
const baseSegura = uri && /\/[^/?]*test[^/?]*(\?|$)/i.test(uri);
const motivoSkip = !uri
    ? 'Definir MONGODB_URI_TEST para ejecutar las pruebas de integración'
    : !baseSegura ? 'El nombre de la base de MONGODB_URI_TEST debe contener "test"' : false;

describe('API AutoBox (integración)', { skip: motivoSkip }, () => {
    let servidor, base, mongoose, Usuario, Turno, cookieAdmin, cookieOperador;
    const ids = {};

    // Cliente HTTP mínimo con cookie y JSON
    const llamar = async (metodo, ruta, { cookie, cuerpo } = {}) => {
        const res = await fetch(base + ruta, {
            method: metodo,
            redirect: 'manual',
            headers: {
                ...(cookie && { Cookie: cookie }),
                ...(cuerpo && { 'Content-Type': 'application/json' })
            },
            body: cuerpo ? JSON.stringify(cuerpo) : undefined
        });
        const texto = await res.text();
        let json = null;
        try { json = JSON.parse(texto); } catch { /* respuesta HTML */ }
        return { res, status: res.status, json };
    };

    const iniciarSesion = async (username, password) => {
        const res = await fetch(base + '/login', {
            method: 'POST',
            redirect: 'manual',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ username, password })
        });
        const cookie = res.headers.getSetCookie().find((c) => c.startsWith('token='));
        return { status: res.status, cookie: cookie?.split(';')[0] };
    };

    before(async () => {
        process.env.NODE_ENV = 'test';
        process.env.MONGODB_URI = uri;
        process.env.JWT_SECRET = process.env.JWT_SECRET || 'secreto-solo-para-tests';

        ({ default: mongoose } = await import('mongoose'));
        ({ default: Usuario } = await import('../../models/Usuario.js'));
        ({ default: Turno } = await import('../../models/Turno.js'));
        const { default: app } = await import('../../app.js');
        const { default: conectarDB } = await import('../../config/db.js');

        await conectarDB();
        await mongoose.connection.dropDatabase(); // estado limpio
        await Turno.init(); // asegura que el índice único esté construido
        await Usuario.create({ username: 'admin_test', password: 'clave1234', nombre: 'Admin Test', rol: 'admin' });
        await Usuario.create({ username: 'operador_test', password: 'clave1234', nombre: 'Operador Test', rol: 'operador' });

        await new Promise((ok) => { servidor = app.listen(0, ok); });
        base = `http://127.0.0.1:${servidor.address().port}`;

        cookieAdmin = (await iniciarSesion('admin_test', 'clave1234')).cookie;
        cookieOperador = (await iniciarSesion('operador_test', 'clave1234')).cookie;
    });

    after(async () => {
        await new Promise((ok) => servidor.close(ok));
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    it('login correcto entrega la cookie con el token', () => {
        assert.ok(cookieAdmin, 'el admin debe recibir cookie');
        assert.ok(cookieOperador, 'el operador debe recibir cookie');
    });

    it('login con contraseña incorrecta responde 401 y no entrega cookie', async () => {
        const { status, cookie } = await iniciarSesion('admin_test', 'incorrecta');
        assert.equal(status, 401);
        assert.equal(cookie, undefined);
    });

    it('la API rechaza con 401 las peticiones sin sesión', async () => {
        for (const ruta of ['/api/clientes', '/api/vehiculos', '/api/turnos']) {
            assert.equal((await llamar('GET', ruta)).status, 401, ruta);
        }
        assert.equal((await llamar('DELETE', '/api/clientes/123')).status, 401);
    });

    it('un operador no puede entrar a /usuarios (403) y un admin sí (200)', async () => {
        assert.equal((await llamar('GET', '/usuarios', { cookie: cookieOperador })).status, 403);
        assert.equal((await llamar('GET', '/usuarios', { cookie: cookieAdmin })).status, 200);
    });

    it('flujo relacional: cliente -> vehículo -> turno', async () => {
        const c = await llamar('POST', '/api/clientes', {
            cookie: cookieAdmin,
            cuerpo: { nombre: 'Ana', apellido: 'Pérez', telefono: '1155550000', email: 'ana@test.com' }
        });
        assert.equal(c.status, 201);
        ids.cliente = c.json.cliente?._id ?? c.json._id;

        const v = await llamar('POST', '/api/vehiculos', {
            cookie: cookieAdmin,
            cuerpo: { patente: 'ab123cd', marca: 'Ford', modelo: 'Fiesta', clienteId: ids.cliente }
        });
        assert.equal(v.status, 201);
        ids.vehiculo = v.json.vehiculo?._id ?? v.json._id;

        const t = await llamar('POST', '/api/turnos', {
            cookie: cookieAdmin,
            cuerpo: { clienteId: ids.cliente, vehiculoId: ids.vehiculo, fecha: '2026-12-01', hora: '10:00', servicio: 'Cambio de aceite' }
        });
        assert.equal(t.status, 201);
        ids.turno = t.json.turno._id;
    });

    it('email duplicado responde 400', async () => {
        const r = await llamar('POST', '/api/clientes', {
            cookie: cookieAdmin,
            cuerpo: { nombre: 'Otra', apellido: 'Persona', telefono: '1100000000', email: 'ana@test.com' }
        });
        assert.equal(r.status, 400);
    });

    it('un turno en un horario ocupado responde 409 Conflict', async () => {
        const r = await llamar('POST', '/api/turnos', {
            cookie: cookieAdmin,
            cuerpo: { clienteId: ids.cliente, vehiculoId: ids.vehiculo, fecha: '2026-12-01', hora: '10:00', servicio: 'Alineación' }
        });
        assert.equal(r.status, 409);
    });

    it('dos reservas simultáneas del mismo horario: solo una se confirma', async () => {
        const reservar = () => llamar('POST', '/api/turnos', {
            cookie: cookieAdmin,
            cuerpo: { clienteId: ids.cliente, vehiculoId: ids.vehiculo, fecha: '2026-12-02', hora: '09:30', servicio: 'Frenos' }
        });
        const resultados = await Promise.all([reservar(), reservar(), reservar()]);
        const estados = resultados.map((r) => r.status).sort();
        assert.deepEqual(estados, [201, 409, 409]);
    });

    it('formato de fecha u hora inválido responde 400', async () => {
        const r = await llamar('POST', '/api/turnos', {
            cookie: cookieAdmin,
            cuerpo: { clienteId: ids.cliente, vehiculoId: ids.vehiculo, fecha: '01/12/2026', hora: '10:00', servicio: 'Frenos' }
        });
        assert.equal(r.status, 400);
    });

    it('PUT de turno ignora campos no permitidos (activo)', async () => {
        const r = await llamar('PUT', `/api/turnos/${ids.turno}`, {
            cookie: cookieAdmin,
            cuerpo: { servicio: 'Service completo', activo: false }
        });
        assert.equal(r.status, 200);
        assert.equal(r.json.turno.activo, true);
        assert.equal(r.json.turno.servicio, 'Service completo');
    });

    it('no se elimina un cliente con vehículos activos (400) ni un vehículo con turnos activos (400)', async () => {
        assert.equal((await llamar('DELETE', `/api/clientes/${ids.cliente}`, { cookie: cookieAdmin })).status, 400);
        assert.equal((await llamar('DELETE', `/api/vehiculos/${ids.vehiculo}`, { cookie: cookieAdmin })).status, 400);
    });

    it('cancelar un turno es baja lógica y libera el horario', async () => {
        const cancelar = await llamar('DELETE', `/api/turnos/${ids.turno}`, { cookie: cookieAdmin });
        assert.equal(cancelar.status, 200);

        const enBase = await Turno.findById(ids.turno);
        assert.ok(enBase, 'el documento sigue en la colección');
        assert.equal(enBase.activo, false);

        const reutilizar = await llamar('POST', '/api/turnos', {
            cookie: cookieAdmin,
            cuerpo: { clienteId: ids.cliente, vehiculoId: ids.vehiculo, fecha: '2026-12-01', hora: '10:00', servicio: 'Alineación' }
        });
        assert.equal(reutilizar.status, 201);
    });

    it('un ID mal formado responde 400 en JSON', async () => {
        const r = await llamar('GET', '/api/turnos/abc', { cookie: cookieAdmin });
        assert.equal(r.status, 400);
        assert.ok(r.json?.mensaje);
    });
});
