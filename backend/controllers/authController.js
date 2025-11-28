import User from '../models/UserModel.js'
import jwt from 'jsonwebtoken'

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secreto_super_seguro', {
        expiresIn: '30d'
    })
}

export const register = async (req, res, next) => {
    try {
        const { name, password, role } = req.body

        const userExists = await User.findOne({ name })

        if (userExists) {
            const error = new Error('El usuario ya existe')
            error.statusCode = 400
            throw error
        }

        const user = await User.create({
            name,
            password,
            role
        })

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                role: user.role,
                token: generateToken(user._id)
            })
        } else {
            const error = new Error('Datos de usuario inválidos')
            error.statusCode = 400
            throw error
        }
    } catch (error) {
        next(error)
    }
}

export const login = async (req, res, next) => {
    try {
        const { name, password } = req.body

        const user = await User.findOne({ name })

        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                role: user.role,
                token: generateToken(user._id)
            })
        } else {
            const error = new Error('Credenciales inválidas')
            error.statusCode = 401
            throw error
        }
    } catch (error) {
        next(error)
    }
}
