import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Payment, AddPaymentResponse } from '../types/payment';

const LOCALSTORAGE_KEY = 'payments';
const apiUrl = import.meta.env.VITE_API_URL;

export function usePayments() {
    const queryClient = useQueryClient();

    const paymentsQuery = useQuery<Payment[]>({
        queryKey: ['payments'],
        queryFn: async () => {
            const stored = localStorage.getItem(LOCALSTORAGE_KEY);
            if (stored) return JSON.parse(stored);

            const res = await fetch(`${apiUrl}/api/payments`);
            if (!res.ok) throw new Error('Error al cargar pagos');
            const data = await res.json();
            localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(data));
            return data;
        },
    });

    const addPaymentMutation = useMutation<AddPaymentResponse, Error, { name: string; mes: string; monto: number }>({
        mutationFn: async ({ name, mes, monto }) => {
            const res = await fetch(`${apiUrl}/api/payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, mes, monto }),
            });
            if (!res.ok) throw new Error('Error al agregar pago');
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.setQueryData<Payment[]>(['payments'], (old) => {
                const updated = old ? [...old, data.payment] : [data.payment];
                localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(updated));
                return updated;
            });
        },
    });

    return {
        payments: paymentsQuery.data ?? [],
        isLoading: paymentsQuery.isLoading,
        error: paymentsQuery.error,
        addPayment: addPaymentMutation.mutateAsync,
        isAdding: addPaymentMutation.isPending,
    };
}
