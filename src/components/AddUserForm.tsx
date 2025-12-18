import { useState } from 'react'
import { useUsers } from '../hooks/useUsers'

const AddUserForm = () => {
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const { addUser, isAdding } = useUsers()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            setTimeout(() => setError(''), 2000)
            setError('El campo es requerido')
            return
        }

        try {
            await addUser(name.trim())
            setName('')
            setError('')
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 w-full max-w-lg mx-auto px-2"
        >
            <div className="flex-1 relative">
                <input
                    type="text"
                    value={name}
                    onChange={e => {
                        setName(e.target.value)
                        if (error) setError('')
                    }}
                    placeholder="Nombre del usuario"
                    disabled={isAdding}
                    className={`w-full border bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:border-gray-600 placeholder:text-gray-500 dark:placeholder:text-gray-400 px-3 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors
            ${error ? 'border-red-500 focus:ring-red-400' : 'focus:ring-blue-400 dark:focus:ring-blue-500'} 
            disabled:opacity-50`}
                />
                {error && (
                    <p className="absolute left-0 -bottom-5 text-red-600 dark:text-red-400 text-sm text-center w-full ">
                        {error}
                    </p>
                )}
            </div>


            <button
                type="submit"
                disabled={isAdding}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isAdding ? 'Agregando...' : 'Agregar'}
            </button>
        </form>
    )
}

export default AddUserForm
