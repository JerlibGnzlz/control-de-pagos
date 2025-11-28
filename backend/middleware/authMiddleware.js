import jwt from 'jsonwebtoken'
import User from '../models/UserModel.js'

export const protect = async (req, res, next) => {
    let token

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Obtener token del header
            token = req.headers.authorization.split(' ')[1]

            // Verificar token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro')

            // Obtener usuario del token
            req.user = await User.findById(decoded.id).select('-password')

            next()
        } catch (error) {
            console.error(error)
            const err = new Error('No autorizado, token fallido')
            err.statusCode = 401
            next(err)
        }
    }

    if (!token) {
        const error = new Error('No autorizado, no hay token')
        error.statusCode = 401
        next(error)
    }
}
