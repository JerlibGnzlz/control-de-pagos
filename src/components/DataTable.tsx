import { useState } from 'react'
import { useUsers } from '../hooks/useUsers'
import { usePayments } from '../hooks/usePayments'
import { MESES } from './PaymentForm'
import type { User } from '../types/payment'

const DataTable = () => {
    const { users } = useUsers()
    const { payments } = usePayments()

    // Pago de alquiler por mes (editable)
    const [alquilerMes, setAlquilerMes] = useState<number[]>(
        [0, 0, 0, 0, 100000, 100000, 100000, 100000, 100000, 0, 0, 0] // Ajustar según MESES
    )

    // Obtener pago de un usuario en un mes
    const getPagoPorMes = (userName: string, mes: string) =>
        payments.find(p => p?.userName === userName && p?.mes === mes)?.monto ?? 0

    // Total pagado por un usuario
    const getTotal = (userName: string) =>
        payments
            .filter(p => p?.userName === userName)
            .reduce((acc, curr) => acc + (curr?.monto ?? 0), 0)

    // Total recaudado por mes
    const getTotalPorMes = (mes: string) =>
        payments
            .filter(p => p?.mes === mes)
            .reduce((acc, curr) => acc + (curr?.monto ?? 0), 0)

    // Cambiar monto de alquiler
    const handleAlquilerChange = (idx: number, value: number) => {
        const nuevos = [...alquilerMes]
        nuevos[idx] = value
        setAlquilerMes(nuevos)
    }

    // Cálculo de saldos acumulados mes a mes
    const getSaldoAcumuladoPorMes = () => {
        let saldo = 0
        return MESES.map((mes, idx) => {
            const recaudado = getTotalPorMes(mes)
            const alquiler = alquilerMes[idx]
            saldo += recaudado - alquiler
            return saldo
        })
    }

    const saldos = getSaldoAcumuladoPorMes()

    return (
        <div className="w-full flex justify-center">
            <div>
                <table className="table-auto w-full">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                            <th className="border px-2 py-2 text-left">Usuario</th>
                            {MESES.map(m => (
                                <th key={m} className="border px-2 py-2 text-center whitespace-nowrap">{m}</th>
                            ))}
                            <th className="border px-2 py-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u: User) => (
                            <tr key={u._id} className="even:bg-gray-50 hover:bg-blue-50 transition-colors">
                                <td className="border px-2 py-2 font-medium text-left whitespace-nowrap">{u.name}</td>
                                {MESES.map((m) => {
                                    const pago = getPagoPorMes(u.name, m)
                                    return (
                                        <td key={m} className="border px-2 py-1 text-center whitespace-nowrap">
                                            {pago ? `$${pago}` : '-'}
                                        </td>
                                    )
                                })}
                                <td className="border px-2 py-2 text-right font-semibold whitespace-nowrap">${getTotal(u.name)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-200 font-semibold">
                        {/* Total recaudado */}
                        <tr className="bg-green-100">
                            <td className="border px-2 py-2 text-left">Total recaudado</td>
                            {MESES.map((mes) => (
                                <td key={mes} className="border px-2 py-2 text-center">
                                    ${getTotalPorMes(mes)}
                                </td>
                            ))}
                            <td className="border px-2 py-2 text-right">
                                ${users.reduce((acc, u) => acc + getTotal(u.name), 0)}
                            </td>
                        </tr>

                        {/* Pago de alquiler editable */}
                        <tr className="bg-yellow-100">
                            <td className="border px-2 py-2 text-left">Pago de alquiler</td>
                            {MESES.map((m) => (
                                <td key={m} className="border px-2 py-2 text-center">
                                    <input
                                        type="number"
                                        className="w-20 text-center border rounded px-1 py-0.5"
                                        value={alquilerMes[MESES.indexOf(m)]}
                                        onChange={e => handleAlquilerChange(MESES.indexOf(m), Number(e.target.value))}
                                    />
                                </td>
                            ))}
                            <td className="border px-2 py-2 text-right">
                                ${alquilerMes.reduce((acc, curr) => acc + curr, 0)}
                            </td>
                        </tr>

                        {/* Sobrante acumulado */}
                        <tr className="bg-blue-100">
                            <td className="border px-2 py-2 text-left">Saldo acumulado</td>
                            {saldos.map((saldo, idx) => (
                                <td key={idx} className="border px-2 py-2 text-center">
                                    ${saldo}
                                </td>
                            ))}
                            <td className="border px-2 py-2 text-right">
                                ${saldos[saldos.length - 1]}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    )
}

export default DataTable
