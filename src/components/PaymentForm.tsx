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
            className="flex flex-col sm:flex-row sm:flex-wrap gap-3 p-4 bg-white rounded-lg shadow-md mb-4 w-full max-w-3xl mx-auto"
        >
            {/* Usuario */}
            <select
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="border px-3 py-2 rounded-md flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                className="border px-3 py-2 rounded-md flex-1 min-w-[160px] focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                className="border px-3 py-2 rounded-md flex-1 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {/* Botón */}
            <button
                type="submit"
                disabled={isAdding}
                className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
            >
                {isAdding ? 'Agregando...' : 'Agregar'}
            </button>

            {/* Mensaje */}
            {message && (
                <p className={`mt-2 sm:mt-0 w-full text-center font-medium ${message.includes('correcto') ? 'text-green-600' : 'text-red-600'}`}>
                    {message}
                </p>
            )}
        </form>
    )
}

export default PaymentForm
