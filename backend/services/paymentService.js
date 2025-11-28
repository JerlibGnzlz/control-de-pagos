import mongoose from 'mongoose';
import UserModel from "../models/UserModel.js";
import PaymentModel from '../models/PaymentModel.js';

export const findUserByIdOrName = async (userId, name) => {
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        return await UserModel.findById(userId);
    } else if (name) {
        return await UserModel.findOne({ name });
    }
    return null;
};

export const checkExistingPayment = async (userId, mes) => {
    return await PaymentModel.findOne({
        user: userId,
        mes
    });
};

export const createPaymentRecord = async (user, mes, monto) => {
    // Crear nuevo pago
    const newPayment = new PaymentModel({
        user: user._id,
        mes,
        monto
    });
    await newPayment.save();

    // Guardar referencia en el usuario
    user.payments.push(newPayment._id);
    await user.save();

    // Popular datos del usuario
    await newPayment.populate('user', 'name');

    return newPayment;
};

export const getAllPayments = async () => {
    // Buscar todos los pagos sin populate
    const payments = await PaymentModel.find();

    // Buscar todos los usuarios de una vez
    const userIds = payments.map(p => p.user || p.name).filter(Boolean);
    const users = await UserModel.find({ _id: { $in: userIds } });
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    // Transform to match frontend expectations
    return payments
        .map(payment => {
            // Soporte para formato antiguo (campo 'name') y nuevo (campo 'user')
            const userId = payment.user || payment.name;

            if (!userId) return null;

            const user = userMap.get(userId.toString());
            if (!user) return null;

            return {
                _id: payment._id,
                userId: user._id,
                userName: user.name,
                mes: payment.mes,
                monto: payment.monto
            };
        })
        .filter(payment => payment !== null);
};
