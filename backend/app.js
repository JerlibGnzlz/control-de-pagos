import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

import { userRoutes } from './routes/users.js'
import { settinghRoutes } from './routes/settingRoutes.js'
import { paymentRoutes } from './routes/paymentRoutes.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/users', userRoutes)
app.use('/api/payments', paymentRoutes)


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