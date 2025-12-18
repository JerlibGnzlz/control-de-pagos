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

export function useUsers(includeInactive = false) {
    const queryClient = useQueryClient()

    // Query para obtener usuarios
    const usersQuery = useQuery<User[]>({
        queryKey: ['users', includeInactive],
        queryFn: async () => {
            const url = includeInactive
                ? `${apiUrl}/api/users?includeInactive=true`
                : `${apiUrl}/api/users`;

            const res = await fetch(url, {
                headers: getAuthHeaders()
            })
            if (!res.ok) throw new Error('Error al cargar usuarios')
            const data = await res.json()
            return Array.isArray(data) ? data : []
        },
    })

    // Mutation para agregar usuario
    const addUserMutation = useMutation<AddUserResponse, Error, string>({
        mutationFn: async (name: string) => {
            const res = await fetch(`${apiUrl}/api/users`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ name }),
            })
            if (!res.ok) throw new Error('Error al crear usuario')
            const json = await res.json()
            return json
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
    })

    // Mutation para actualizar usuario
    const updateUserMutation = useMutation<User, Error, { id: string, name: string }>({
        mutationFn: async ({ id, name }) => {
            const res = await fetch(`${apiUrl}/api/users/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ name }),
            })
            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message || 'Error al actualizar usuario')
            }
            const json = await res.json()
            return json.user
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
    })

    // Mutation para desactivar usuario (soft delete)
    const deleteUserMutation = useMutation<User, Error, string>({
        mutationFn: async (id: string) => {
            const res = await fetch(`${apiUrl}/api/users/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            })
            if (!res.ok) throw new Error('Error al desactivar usuario')
            const json = await res.json()
            return json.user
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
    })

    // Mutation para reactivar usuario
    const reactivateUserMutation = useMutation<User, Error, string>({
        mutationFn: async (id: string) => {
            const res = await fetch(`${apiUrl}/api/users/${id}/reactivate`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
            })
            if (!res.ok) throw new Error('Error al reactivar usuario')
            const json = await res.json()
            return json.user
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
    })

    return {
        users: usersQuery.data ?? [],
        isLoading: usersQuery.isLoading,
        error: usersQuery.error,
        addUser: addUserMutation.mutateAsync,
        isAdding: addUserMutation.isPending,
        updateUser: updateUserMutation.mutateAsync,
        isUpdating: updateUserMutation.isPending,
        deleteUser: deleteUserMutation.mutateAsync,
        isDeleting: deleteUserMutation.isPending,
        reactivateUser: reactivateUserMutation.mutateAsync,
        isReactivating: reactivateUserMutation.isPending,
    }
}
