import User from "../models/UserModel.js"

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
