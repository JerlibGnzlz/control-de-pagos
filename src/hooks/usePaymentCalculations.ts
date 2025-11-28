import { useState, useMemo } from 'react';
import type { Payment, User } from '../types/payment';
import { MESES } from '../components/PaymentForm';

export const usePaymentCalculations = (users: User[], payments: Payment[]) => {
    // Pago de alquiler por mes (editable)
    // TODO: Esto idealmente debería venir del backend o configuración
    const [alquilerMes, setAlquilerMes] = useState<number[]>(
        [0, 0, 0, 0, 100000, 100000, 100000, 100000, 100000, 100000, 150000, 100000]
    );

    // Obtener pago de un usuario en un mes
    const getPagoPorMes = (userName: string, mes: string) =>
        payments.find(p => p?.userName?.toLowerCase() === userName?.toLowerCase() && p?.mes === mes)?.monto ?? 0;

    // Total pagado por un usuario
    const getTotalPorUsuario = (userName: string) =>
        payments
            .filter(p => p?.userName?.toLowerCase() === userName?.toLowerCase())
            .reduce((acc, curr) => acc + (curr?.monto ?? 0), 0);

    // Total recaudado por mes
    const getTotalPorMes = (mes: string) =>
        payments
            .filter(p => p?.mes === mes)
            .reduce((acc, curr) => acc + (curr?.monto ?? 0), 0);

    // Cambiar monto de alquiler
    const handleAlquilerChange = (idx: number, value: number) => {
        const nuevos = [...alquilerMes];
        nuevos[idx] = value;
        setAlquilerMes(nuevos);
    };

    // Cálculo de saldos acumulados mes a mes
    const saldosAcumulados = useMemo(() => {
        let saldo = 0;
        return MESES.map((mes, idx) => {
            const recaudado = getTotalPorMes(mes);
            const alquiler = alquilerMes[idx];
            saldo += recaudado - alquiler;
            return saldo;
        });
    }, [payments, alquilerMes]);

    const totalRecaudado = useMemo(() =>
        users.reduce((acc, u) => acc + getTotalPorUsuario(u.name), 0),
        [users, payments]
    );

    const totalAlquiler = useMemo(() =>
        alquilerMes.reduce((acc, curr) => acc + curr, 0),
        [alquilerMes]
    );

    return {
        alquilerMes,
        handleAlquilerChange,
        getPagoPorMes,
        getTotalPorUsuario,
        getTotalPorMes,
        saldosAcumulados,
        totalRecaudado,
        totalAlquiler
    };
};
