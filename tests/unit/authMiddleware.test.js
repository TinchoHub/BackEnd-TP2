import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { protegerApi, protegerRuta, esAdmin } from '../../middlewares/authMiddleware.js';

// Respuesta simulada con los métodos que usan los middlewares
const crearRes = () => {
    const res = { codigo: 200, cuerpo: null, destino: null };
    res.status = (c) => { res.codigo = c; return res; };
    res.json = (b) => { res.cuerpo = b; return res; };
    res.render = (vista, b) => { res.cuerpo = { vista, ...b }; return res; };
    res.redirect = (u) => { res.destino = u; return res; };
    return res;
};

describe('authMiddleware', () => {
    it('protegerApi responde 401 JSON si no hay usuario', () => {
        const res = crearRes();
        protegerApi({}, res, () => assert.fail('no debe continuar'));
        assert.equal(res.codigo, 401);
        assert.ok(res.cuerpo.mensaje);
    });

    it('protegerApi continúa si hay usuario', () => {
        let continuo = false;
        protegerApi({ usuario: { rol: 'operador' } }, crearRes(), () => { continuo = true; });
        assert.equal(continuo, true);
    });

    it('protegerRuta redirige a /login si no hay usuario', () => {
        const res = crearRes();
        protegerRuta({}, res, () => assert.fail('no debe continuar'));
        assert.equal(res.destino, '/login');
    });

    it('esAdmin rechaza con 403 a un operador', () => {
        const res = crearRes();
        esAdmin({ usuario: { rol: 'operador' } }, res, () => assert.fail('no debe continuar'));
        assert.equal(res.codigo, 403);
    });

    it('esAdmin deja pasar a un admin', () => {
        let continuo = false;
        esAdmin({ usuario: { rol: 'admin' } }, crearRes(), () => { continuo = true; });
        assert.equal(continuo, true);
    });
});
