import User from "../models/UserModel.js"
export const createUser = async (req, res) => {
    const { name } = req.body

    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'El nombre es obligatorio.' })
    }

    try {
        const existe = await User.findOne({ name })

        if (existe) {
            return res.status(409).json({
                message: 'El usuario ya existe',
                user: existe,
            })
        }

        const user = new User({ name: name.toLowerCase() })
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



export const getUserWithPayments = async (req, res) => {
    try {
        const { name } = req.params
        const user = await User.findOne({ name }).populate('payments')
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })

        res.status(200).json(user)
    } catch (error) {
        console.error('Error al obtener usuario:', error)
        res.status(500).json({ message: 'Error al obtener usuario' })
    }
}
