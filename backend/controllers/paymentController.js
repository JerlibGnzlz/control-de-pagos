import mongoose from 'mongoose';
import UserModel from "../models/UserModel.js";
import PaymentModel from '../models/PaymentModel.js';

const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const isValidMonth = (mes) => MESES.includes(mes);

export const createPayment = async (req, res) => {
    try {
        let { userId, name, mes, monto } = req.body;

        // Validación inicial
        if ((!userId && !name) || !mes || monto === undefined) {
            return res.status(400).json({ message: 'Faltan datos necesarios' });
        }

        if (!isValidMonth(mes)) {
            return res.status(400).json({ message: 'Mes inválido' });
        }

        // Buscar usuario ya sea por userId o por name
        let user = null;

        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            user = await UserModel.findById(userId);
        } else if (name) {
            user = await UserModel.findOne({ name });
        }

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar si ya existe pago para ese mes
        const existingPayment = await PaymentModel.findOne({
            user: user._id,
            mes
        });

        if (existingPayment) {
            return res.status(400).json({
                message: `El usuario ya tiene un pago registrado para ${mes}`
            });
        }

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

        res.status(201).json({
            payment: {
                _id: newPayment._id,
                userId: user._id,
                mes: newPayment.mes,
                monto: newPayment.monto,
                userName: user.name
            }
        });
    } catch (error) {
        console.error('Error al crear el pago:', error);
        res.status(500).json({ message: 'Error al crear el pago' });
    }
};
