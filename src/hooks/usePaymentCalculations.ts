import { useState, useMemo, useEffect } from 'react';
import type { Payment, User } from '../types/payment';
import { MESES } from '../components/PaymentForm';

export const usePaymentCalculations = (users: User[], payments: Payment[]) => {
    // Pago de alquiler por mes (editable y persistente)
    // Valores inician en 0 para que el usuario los configure según su necesidad
    const [alquilerMes, setAlquilerMes] = useState<number[]>(() => {
        const saved = localStorage.getItem('alquilerMes');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Verificar que sea un array válido de 12 elementos
                if (Array.isArray(parsed) && parsed.length === 12) {
                    return parsed;
                }
            } catch {
                // Si hay error al parsear, usar valores por defecto
            }
        }
        // Valores iniciales en 0 para todos los meses
        return Array(12).fill(0);
    });

    // Guardar en localStorage cuando cambian los alquileres
    useEffect(() => {
        localStorage.setItem('alquilerMes', JSON.stringify(alquilerMes));
    }, [alquilerMes]);

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
        nuevos[idx] = isNaN(value) ? 0 : value;
        setAlquilerMes(nuevos);
    };

    // Cálculo de saldos acumulados mes a mes
    const saldosAcumulados = useMemo(() => {
        let saldo = 0;
        return MESES.map((mes, idx) => {
            const recaudado = getTotalPorMes(mes);
            const alquiler = alquilerMes[idx] || 0;
            saldo += recaudado - alquiler;
            return saldo;
        });
    }, [payments, alquilerMes]);

    // Diferencia por mes (recaudado - alquiler)
    const diferenciaPorMes = useMemo(() => {
        return MESES.map((mes, idx) => {
            const recaudado = getTotalPorMes(mes);
            const alquiler = alquilerMes[idx] || 0;
            return recaudado - alquiler;
        });
    }, [payments, alquilerMes]);

    const totalRecaudado = useMemo(() =>
        users.reduce((acc, u) => acc + getTotalPorUsuario(u.name), 0),
        [users, payments]
    );

    const totalAlquiler = useMemo(() =>
        alquilerMes.reduce((acc, curr) => acc + (curr || 0), 0),
        [alquilerMes]
    );

    // Saldo final (total recaudado - total alquiler)
    const saldoFinal = useMemo(() =>
        totalRecaudado - totalAlquiler,
        [totalRecaudado, totalAlquiler]
    );

    return {
        alquilerMes,
        handleAlquilerChange,
        getPagoPorMes,
        getTotalPorUsuario,
        getTotalPorMes,
        saldosAcumulados,
        diferenciaPorMes,
        totalRecaudado,
        totalAlquiler,
        saldoFinal
    };
};
