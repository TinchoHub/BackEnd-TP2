import Usuario from '../models/Usuario.js';

// GET /usuarios - Listar todos los usuarios
export const listarUsuarios = async (req, res, next) => {
    try {
        const usuarios = await Usuario.find().select('-password').sort({ createdAt: -1 });

        res.render('usuarios', {
            titulo: 'Usuarios - AutoBox',
            usuarios,
            query: req.query,
            exito: req.query.exito === 'creado' ? 'Usuario registrado con éxito.'
                : req.query.exito === 'eliminado' ? 'Usuario dado de baja correctamente.'
                : null
        });
    } catch (error) {
        next(error);
    }
};

// POST /usuarios/:id/eliminar (baja lógica, igual que el resto de las entidades)
export const eliminarUsuario = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validación simple: evitar auto-eliminación
        if (req.usuario && req.usuario._id.toString() === id) {
            return res.redirect('/usuarios?error=autodelete');
        }

        const usuario = await Usuario.findById(id);
        if (!usuario) {
            return res.redirect('/usuarios?error=notfound');
        }

        // Nunca dejar el sistema sin un administrador activo
        if (usuario.rol === 'admin' && usuario.activo) {
            const adminsActivos = await Usuario.countDocuments({ rol: 'admin', activo: true });
            if (adminsActivos <= 1) {
                return res.redirect('/usuarios?error=ultimoadmin');
            }
        }

        await Usuario.findByIdAndUpdate(id, { activo: false });
        res.redirect('/usuarios?exito=eliminado');
    } catch (error) {
        next(error);
    }
};

// GET: Renderizar formulario
export const renderNuevoUsuario = (req, res) => {
    res.render('usuario-nuevo', {
        titulo: 'Nuevo Usuario - AutoBox',
        rolesDisponibles: ['admin', 'operador']
    });
};

// POST: Procesar alta
export const crearUsuario = async (req, res, next) => {
    try {
        const { username, password, nombre, rol } = req.body;

        const userLimpio = username?.trim().toLowerCase();
        const passLimpia = password?.trim();
        const nombreLimpio = nombre?.trim();
        const rolLimpio = rol?.trim().toLowerCase() || 'operador';

        // 1. Validaciones de presencia
        if (!userLimpio || !passLimpia || !nombreLimpio) {
            return res.status(400).render('usuario-nuevo', {
                error: 'Username, contraseña y nombre son campos obligatorios.',
                valores: { username: userLimpio, nombre: nombreLimpio, rol: rolLimpio }
            });
        }

        // 2. Validaciones de formato
        if (userLimpio.length < 3) {
            return res.status(400).render('usuario-nuevo', {
                error: 'El nombre de usuario debe contener al menos 3 caracteres.',
                valores: { username: userLimpio, nombre: nombreLimpio, rol: rolLimpio }
            });
        }

        if (!/^[a-z0-9_]+$/.test(userLimpio)) {
            return res.status(400).render('usuario-nuevo', {
                error: 'El username solo puede contener letras, números y guión bajo.',
                valores: { username: userLimpio, nombre: nombreLimpio, rol: rolLimpio }
            });
        }

        if (passLimpia.length < 6) {
            return res.status(400).render('usuario-nuevo', {
                error: 'La contraseña debe tener al menos 6 caracteres.',
                valores: { username: userLimpio, nombre: nombreLimpio, rol: rolLimpio }
            });
        }

        // 3. Validación de unicidad en BD
        const existeUsuario = await Usuario.findOne({ username: userLimpio });
        if (existeUsuario) {
            return res.status(400).render('usuario-nuevo', {
                error: `El nombre de usuario "${userLimpio}" ya está registrado.`,
                valores: { username: userLimpio, nombre: nombreLimpio, rol: rolLimpio }
            });
        }

        // 4. Creación y guardado
        const nuevoUsuario = new Usuario({
            username: userLimpio,
            password: passLimpia,
            nombre: nombreLimpio,
            rol: rolLimpio,
            activo: true
        });

        await nuevoUsuario.save();

        res.redirect('/usuarios?exito=creado');

    } catch (error) {
        next(error);
    }
};