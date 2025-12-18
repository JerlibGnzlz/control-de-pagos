import {
    findUserByIdOrName,
    checkExistingPayment,
    createPaymentRecord,
    getAllPayments,
    updatePaymentRecord,
    deletePaymentRecord
} from '../services/paymentService.js';

const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const isValidMonth = (mes) => MESES.includes(mes);

export const getPayments = async (req, res, next) => {
    try {
        const payments = await getAllPayments();
        res.json(payments);
    } catch (error) {
        next(error);
    }
};

export const createPayment = async (req, res, next) => {
    try {
        let { userId, name, mes, monto } = req.body;

        // Validación inicial
        if ((!userId && !name) || !mes || monto === undefined) {
            return res.status(400).json({ message: 'Faltan datos necesarios' });
        }

        if (!isValidMonth(mes)) {
            return res.status(400).json({ message: 'Mes inválido' });
        }

        // Buscar usuario
        const user = await findUserByIdOrName(userId, name);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar si ya existe pago para ese mes
        const existingPayment = await checkExistingPayment(user._id, mes);

        if (existingPayment) {
            return res.status(400).json({
                message: `El usuario ya tiene un pago registrado para ${mes}`
            });
        }

        // Crear nuevo pago usando el servicio
        const newPayment = await createPaymentRecord(user, mes, monto);

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
        next(error);
    }
};

export const updatePayment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { monto } = req.body;

        if (monto === undefined || monto < 0) {
            return res.status(400).json({ message: 'Monto inválido' });
        }

        const updatedPayment = await updatePaymentRecord(id, monto);

        if (!updatedPayment) {
            return res.status(404).json({ message: 'Pago no encontrado' });
        }

        res.json({ message: 'Pago actualizado', payment: updatedPayment });
    } catch (error) {
        next(error);
    }
};

export const deletePayment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const deleted = await deletePaymentRecord(id);

        if (!deleted) {
            return res.status(404).json({ message: 'Pago no encontrado' });
        }

        // NO devolver 204 para que el frontend reciba JSON response si es necesario, 
        // pero estándar REST 200 o 204 está bien. Aquí 200 con mensaje.
        res.json({ message: 'Pago eliminado' });
    } catch (error) {
        next(error);
    }
};
