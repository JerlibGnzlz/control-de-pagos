import mongoose from 'mongoose'


const paymentSchema = new mongoose.Schema({
    name: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mes: { type: String, required: true },
    monto: { type: Number, required: true }
})

export default mongoose.model('Payment', paymentSchema)