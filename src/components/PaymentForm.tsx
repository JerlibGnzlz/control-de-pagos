import { useState } from 'react'
import { useUsers } from '../hooks/useUsers'
import { usePayments } from '../hooks/usePayments'
import type { User } from '../types/payment'

export const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
] as const

const PaymentForm = () => {
    const { users } = useUsers()
    const { payments, addPayment, isAdding } = usePayments()

    const [userName, setUserName] = useState('')
    const [mes, setMes] = useState('')
    const [monto, setMonto] = useState('')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')

        if (!userName || !mes || !monto) {
            setTimeout(() => setMessage(''), 2000)
            setMessage('Todos los campos son obligatorios')
            return
        }

        // Validación frontend: si ya existe el pago
        const yaPago = payments.some(p => p.userName === userName && p.mes === mes)
        if (yaPago) {
            setMessage(`El usuario ${userName} ya tiene un pago registrado para ${mes}`)
            return
        }

        try {
            const result = await addPayment({ name: userName, mes, monto: Number(monto) })
            setMessage(result.message || `Pago agregado correctamente para ${mes}`)
            setUserName('')
            setMes('')
            setMonto('')
        } catch (err: unknown) {
            if (err instanceof Error) {
                setMessage(err.message)
            } else {
                setMessage('Error al registrar pago')
            }
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row sm:flex-wrap gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-4 w-full max-w-3xl mx-auto transition-colors"
        >
            {/* Usuario */}
            <select
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-md flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition-colors"
            >
                <option value="">Selecciona usuario</option>
                {users.map((u: User) => (
                    <option key={u._id} value={u.name}>
                        {u.name}
                    </option>
                ))}
            </select>

            {/* Mes */}
            <select
                value={mes}
                onChange={e => setMes(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-md flex-1 min-w-[160px] focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition-colors disabled:opacity-50"
                disabled={!userName}
            >
                <option value="">Selecciona mes</option>
                {MESES.map(m => {
                    const yaPago = payments.some(p => p.userName === userName && p.mes === m)
                    return (
                        <option key={m} value={m} disabled={yaPago}>
                            {m} {yaPago ? '(Ya pagado)' : ''}
                        </option>
                    )
                })}
            </select>

            {/* Monto */}
            <input
                type="number"
                value={monto}
                onChange={e => setMonto(e.target.value)}
                placeholder="Monto"
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 px-3 py-2 rounded-md flex-1 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition-colors"
            />

            {/* Botón */}
            <button
                type="submit"
                disabled={isAdding}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
            >
                {isAdding ? 'Agregando...' : 'Agregar'}
            </button>

            {/* Mensaje */}
            {message && (
                <p className={`mt-2 sm:mt-0 w-full text-center font-medium ${message.includes('correcto') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {message}
                </p>
            )}
        </form>
    )
}

export default PaymentForm
