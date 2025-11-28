import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

import { userRoutes } from './routes/users.js'
import { paymentRoutes } from './routes/paymentRoutes.js'
import { authRoutes } from './routes/authRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { protect } from './middleware/authMiddleware.js'

dotenv.config()

const app = express()

app.disable('x-powered-by');


const allowedOrigins = [
    'http://localhost:5173', // tu frontend local
];

app.use(cors({
    origin: function (origin, callback) {
        // permitir peticiones sin origin (ej: Postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'El CORS no permite este origen';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/payments', protect, paymentRoutes)

app.use(errorHandler)


const starServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Conectado a MongoDB')
        app.listen(4000, () => console.log('Servidor conectado en http://localhost:4000'))
    } catch (error) {
        console.error('Error al conectar MongoDB:', error)
        process.exit(1)
    }
}

starServer()