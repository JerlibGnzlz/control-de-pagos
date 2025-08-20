import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { User, AddUserResponse } from '../types/payment'

const LOCALSTORAGE_KEY = 'users'
const apiUrl = import.meta.env.VITE_API_URL

export function useUsers() {
    const queryClient = useQueryClient()

    const usersQuery = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: async () => {
            const stored = localStorage.getItem(LOCALSTORAGE_KEY)
            if (stored) {
                const parsed = JSON.parse(stored)
                return Array.isArray(parsed) ? parsed : []
            }

            const res = await fetch(`${apiUrl}/api/users`)
            if (!res.ok) throw new Error('Error al cargar usuarios')
            const data = await res.json()
            return Array.isArray(data) ? data : []
        },
    })

    const addUserMutation = useMutation<AddUserResponse, Error, string>({
        mutationFn: async (name: string) => {
            const res = await fetch(`${apiUrl}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            })
            if (!res.ok) throw new Error('Error al crear usuario')
            return res.json()
        },
        onSuccess: (data) => {
            queryClient.setQueryData<User[]>(['users'], (old) => {
                const updated = old ? [...old, data.user] : [data.user]
                localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(updated))
                return updated
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
