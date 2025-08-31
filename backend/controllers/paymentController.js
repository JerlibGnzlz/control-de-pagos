import mongoose from 'mongoose';
import UserModel from "../models/UserModel.js"
import PaymentModel from '../models/PaymentModel.js';


export const createPayment = async (req, res) => {
    let { userId, mes, monto } = req.body;

    // ✅ Validación de datos
    if (!userId || !mes || monto === undefined) {
        return res.status(400).json({ message: 'Faltan datos necesarios' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'userId inválido' });
    }

    if (!isValidMonth(mes)) {
        return res.status(400).json({ message: 'Mes inválido' });
    }

    if (typeof monto !== 'number' || monto < 0) {
        return res.status(400).json({ message: 'Monto inválido' });
    }

    try {
        // Buscar usuario por ID (seguro)
        const objectId = new mongoose.Types.ObjectId(userId);
        const user = await UserModel.findById(objectId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        // Validación: si ya existe un pago para este mes
        const existingPayment = await PaymentModel.findOne({ name: objectId, mes });
        if (existingPayment) {
            return res.status(400).json({ message: `El usuario ya tiene un pago registrado para ${mes}` });
        }

        // Crear nuevo pago
        const newPayment = new PaymentModel({ name: objectId, mes, monto });
        await newPayment.save();

        // Guardar referencia en el usuario
        user.payments.push(newPayment._id);
        await user.save();

        await newPayment.populate('name', 'name');

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

// Actualizar pago seguro
export const updatePayment = async (req, res) => {
    const { userId, mesOriginal, mes, monto } = req.body;

    if (!userId || !mesOriginal || !mes || monto === undefined) {
        return res.status(400).json({ message: 'Faltan datos necesarios' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'userId inválido' });
    }

    if (!isValidMonth(mes) || !isValidMonth(mesOriginal)) {
        return res.status(400).json({ message: 'Mes inválido' });
    }

    if (typeof monto !== 'number' || monto < 0) {
        return res.status(400).json({ message: 'Monto inválido' });
    }

    try {
        const objectId = new mongoose.Types.ObjectId(userId);

        const updatedPayment = await PaymentModel.findOneAndUpdate(
            { name: objectId, mes: mesOriginal },
            { monto, mes },
            { new: true }
        ).populate('name', 'name');

        if (!updatedPayment) {
            return res.status(404).json({ message: 'Pago no encontrado' });
        }

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