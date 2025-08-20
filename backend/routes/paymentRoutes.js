import express from 'express'
import Payment from '../models/PaymentModel.js'
import { createPayment, updatePayment } from '../controllers/paymentController.js'

export const paymentRoutes = express.Router()

paymentRoutes.get('/', async (req, res) => {
    const pagos = await Payment.find()
    res.json(pagos)
})


paymentRoutes.post("/", createPayment)

paymentRoutes.put('/:id', updatePayment)


