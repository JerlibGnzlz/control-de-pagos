import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    payments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Payment'
        }
    ]
})

export default mongoose.model('User', userSchema)
