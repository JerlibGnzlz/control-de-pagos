import express from 'express'
import { createPayment, getPayments, updatePayment, deletePayment } from '../controllers/paymentController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { createPaymentSchema } from '../schemas/paymentSchemas.js'

export const paymentRoutes = express.Router()

paymentRoutes.get('/', getPayments)

paymentRoutes.post("/", validateRequest(createPaymentSchema), createPayment)

// Nuevas rutas para editar y eliminar
paymentRoutes.put("/:id", updatePayment)
paymentRoutes.delete("/:id", deletePayment)
