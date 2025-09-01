import mongoose from 'mongoose'


const paymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mes: { type: String, required: true },
    monto: { type: Number, required: true }
});

export default mongoose.model('Payment', paymentSchema)