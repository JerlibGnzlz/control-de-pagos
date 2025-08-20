import { useState } from 'react'
import { useUsers } from '../hooks/useUsers'

const AddUserForm = () => {
    const [name, setName] = useState('')
    const { addUser, isAdding } = useUsers()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return
        try {
            await addUser(name.trim())
            setName('')
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 w-full max-w-lg mx-auto px-2"
        >
            <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nombre del usuario"
                disabled={isAdding}
                className="flex-1 border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            />
            <button
                type="submit"
                disabled={isAdding}
                className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isAdding ? 'Agregando...' : 'Agregar'}
            </button>
        </form>
    )
}

export default AddUserForm
