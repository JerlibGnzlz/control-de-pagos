import mongoose from 'mongoose';
import UserModel from "../models/UserModel.js"
import PaymentModel from '../models/PaymentModel.js';


export const createPayment = async (req, res) => {
    let { name, mes, monto } = req.body;

    // ✅ Validar datos
    if (!name || !mes || monto === undefined) {
        return res.status(400).json({ message: 'Faltan datos necesarios' });
    }

    // Validar mes permitido
    if (!isValidMonth(mes)) {
        return res.status(400).json({ message: 'Mes inválido' });
    }

    // Validar monto
    if (typeof monto !== 'number' || monto < 0) {
        return res.status(400).json({ message: 'Monto inválido' });
    }

    try {
        // ⚡️ Sanear string: quitar espacios y caracteres peligrosos
        name = name.trim();

        // Buscar usuario por nombre de forma segura
        const user = await UserModel.findOne({ name });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        // Validar si ya existe un pago para este mes
        const existingPayment = await PaymentModel.findOne({ name: user._id, mes });
        if (existingPayment) {
            return res.status(400).json({ message: `El usuario ya tiene un pago registrado para ${mes}` });
        }

        // Crear nuevo pago
        const newPayment = new PaymentModel({ name: user._id, mes, monto });
        await newPayment.save();

        // Guardar referencia en el usuario
        user.payments.push(newPayment._id);
        await user.save();

        await newPayment.populate('name');

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



export const updatePayment = async (req, res) => {
    const { userId, mesOriginal, mes, monto } = req.body;

    if (!userId || !mesOriginal || !mes || monto === undefined) {
        return res.status(400).json({ message: 'Faltan datos necesarios' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'userId inválido' });
    }

    try {
        const objectId = new mongoose.Types.ObjectId(userId);

        const updatedPayment = await PaymentModel.findOneAndUpdate(
            { name: objectId, mes: mesOriginal },
            { monto, mes },
            { new: true }
        ).populate('name', 'name'); // solo el campo name

        if (!updatedPayment) {
            return res.status(404).json({ message: 'Pago no encontrado' });
        }

        // Devolver el pago actualizado en formato uniforme
        res.status(200).json({
            payment: {
                _id: updatedPayment._id,
                userId: updatedPayment.name._id,
                mes: updatedPayment.mes,
                monto: updatedPayment.monto,
                userName: updatedPayment.name.name
            }
        });
    } catch (error) {
        console.error('Error al actualizar pago:', error);
        res.status(500).json({ message: 'Error al actualizar pago' });
    }
};

