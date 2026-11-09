import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import errorHandler from '../../middlewares/errorHandler.js';

const crearRes = () => {
    const res = { codigo: 200, cuerpo: null, vista: null };
    res.status = (c) => { res.codigo = c; return res; };
    res.json = (b) => { res.cuerpo = b; return res; };
    res.render = (vista, b) => { res.vista = vista; res.cuerpo = b; return res; };
    return res;
};

describe('errorHandler', () => {
    const consolaOriginal = console.error;
    beforeEach(() => { console.error = () => {}; }); // evita ruido en la salida de los tests
    afterEach(() => { console.error = consolaOriginal; });

    it('CastError en /api responde 400 en JSON', () => {
        const res = crearRes();
        errorHandler({ name: 'CastError', value: 'abc' }, { originalUrl: '/api/turnos/abc' }, res, () => {});
        assert.equal(res.codigo, 400);
        assert.match(res.cuerpo.mensaje, /abc/);
    });

    it('error en una ruta web renderiza la vista', () => {
        const res = crearRes();
        errorHandler({ name: 'CastError', value: 'abc' }, { originalUrl: '/clientes/abc' }, res, () => {});
        assert.equal(res.vista, '404');
        assert.equal(res.codigo, 400);
    });

    it('clave duplicada (11000) informa el campo en conflicto', () => {
        const res = crearRes();
        errorHandler({ code: 11000, keyValue: { email: 'a@b.com' } }, { originalUrl: '/api/clientes' }, res, () => {});
        assert.equal(res.codigo, 400);
        assert.match(res.cuerpo.mensaje, /email/);
    });

    it('ValidationError desglosa los mensajes', () => {
        const res = crearRes();
        const err = { name: 'ValidationError', errors: { a: { message: 'Falta A' }, b: { message: 'Falta B' } } };
        errorHandler(err, { originalUrl: '/api/clientes' }, res, () => {});
        assert.deepEqual(res.cuerpo.detalles, ['Falta A', 'Falta B']);
    });
});
