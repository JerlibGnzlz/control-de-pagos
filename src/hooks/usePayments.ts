import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Payment, AddPaymentResponse } from '../types/payment';

const apiUrl = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = sessionStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export function usePayments() {
    const queryClient = useQueryClient();

    const paymentsQuery = useQuery<Payment[]>({
        queryKey: ['payments'],
        queryFn: async () => {
            const res = await fetch(`${apiUrl}/api/payments`, {
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Error al cargar pagos');
            const data = await res.json();
            return data;
        },
    });

    const addPaymentMutation = useMutation<AddPaymentResponse, Error, { name: string; mes: string; monto: number }>({
        mutationFn: async ({ name, mes, monto }) => {
            const res = await fetch(`${apiUrl}/api/payments`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ name, mes, monto }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Error al agregar pago');
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
        },
    });

    const updatePaymentMutation = useMutation<any, Error, { id: string; monto: number }>({
        mutationFn: async ({ id, monto }) => {
            const res = await fetch(`${apiUrl}/api/payments/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ monto }),
            });
            if (!res.ok) throw new Error('Error al actualizar pago');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
        },
    });

    const deletePaymentMutation = useMutation<any, Error, string>({
        mutationFn: async (id) => {
            const res = await fetch(`${apiUrl}/api/payments/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error('Error al eliminar pago');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
        },
    });

    return {
        payments: paymentsQuery.data ?? [],
        isLoading: paymentsQuery.isLoading,
        error: paymentsQuery.error,
        addPayment: addPaymentMutation.mutateAsync,
        isAdding: addPaymentMutation.isPending,
        updatePayment: updatePaymentMutation.mutateAsync,
        isUpdating: updatePaymentMutation.isPending,
        deletePayment: deletePaymentMutation.mutateAsync,
        isDeleting: deletePaymentMutation.isPending
    };
}
