import User from "../models/UserModel.js"

export const getUsers = async (req, res, next) => {
    try {
        // Por defecto, traer solo usuarios activos
        // Usar query param ?includeInactive=true para traer todos
        const includeInactive = req.query.includeInactive === 'true';
        const filter = includeInactive ? {} : { active: true };

        const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        next(error);
    }
};

export const createUser = async (req, res) => {
    const { name } = req.body

    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'El nombre es obligatorio.' })
    }

    try {
        const safeName = name.trim()

        // Verificar si ya existe
        const existe = await User.findOne({ name: safeName.toLowerCase() })
        if (existe) {
            return res.status(409).json({
                message: 'El usuario ya existe',
                user: existe,
            })
        }

        // Crear si no existe
        const user = new User({ name: safeName.toLowerCase() })
        await user.save()

        res.status(201).json({
            message: 'Usuario creado con éxito',
            user,
        })

    } catch (err) {
        console.error('Error al crear usuario:', err)
        res.status(500).json({ error: 'Error al crear usuario' })
    }
}

// Actualizar usuario
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'El nombre es obligatorio.' });
    }

    try {
        const safeName = name.trim().toLowerCase();

        // Verificar si el usuario existe
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar si el nuevo nombre ya existe (excepto el mismo usuario)
        const existeNombre = await User.findOne({
            name: safeName,
            _id: { $ne: id }
        });

        if (existeNombre) {
            return res.status(409).json({
                message: 'Ya existe otro usuario con ese nombre'
            });
        }

        // Actualizar
        user.name = safeName;
        await user.save();

        res.json({
            message: 'Usuario actualizado con éxito',
            user
        });

    } catch (err) {
        console.error('Error al actualizar usuario:', err);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
};

// Desactivar usuario (soft delete)
export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Soft delete: cambiar active a false
        user.active = false;
        await user.save();

        res.json({
            message: 'Usuario desactivado con éxito',
            user
        });

    } catch (err) {
        console.error('Error al desactivar usuario:', err);
        res.status(500).json({ error: 'Error al desactivar usuario' });
    }
};

// Reactivar usuario
export const reactivateUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Reactivar: cambiar active a true
        user.active = true;
        await user.save();

        res.json({
            message: 'Usuario reactivado con éxito',
            user
        });

    } catch (err) {
        console.error('Error al reactivar usuario:', err);
        res.status(500).json({ error: 'Error al reactivar usuario' });
    }
};

