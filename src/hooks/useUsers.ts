import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { User, AddUserResponse } from '../types/payment'

const apiUrl = import.meta.env.VITE_API_URL

const getAuthHeaders = () => {
    const token = sessionStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export function useUsers() {
    const queryClient = useQueryClient()

    const usersQuery = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await fetch(`${apiUrl}/api/users`, {
                headers: getAuthHeaders()
            })
            if (!res.ok) throw new Error('Error al cargar usuarios')
            const data = await res.json()
            return Array.isArray(data) ? data : []
        },
    })

    const addUserMutation = useMutation<AddUserResponse, Error, string>({
        mutationFn: async (name: string) => {
            const res = await fetch(`${apiUrl}/api/users`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ name }),
            })
            if (!res.ok) throw new Error('Error al crear usuario')
            const json = await res.json()
            console.log("Respuesta backend:", json)
            return json
        },
        onSuccess: (data: AddUserResponse) => {
            const newUser = data.user ?? data // usa data.user si existe, si no usa data directo
            queryClient.setQueryData<User[]>(['users'], (old) => {
                return old ? [...old, newUser] : [newUser]
            })
        },

    })


    return {
        users: usersQuery.data ?? [],
        isLoading: usersQuery.isLoading,
        error: usersQuery.error,
        addUser: addUserMutation.mutateAsync,
        isAdding: addUserMutation.isPending,
    }
}
