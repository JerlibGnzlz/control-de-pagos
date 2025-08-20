import { useUsers } from '../hooks/useUsers'
import { usePayments } from '../hooks/usePayments'
import { MESES } from './PaymentForm'
import type { User } from '../types/payment'

const DataTable = () => {
    const { users } = useUsers()
    const { payments } = usePayments()
    const getPagoPorMes = (userName: string, mes: string) =>
        payments.find(p => p?.userName === userName && p?.mes === mes)?.monto ?? '';

    const getTotal = (userName: string) =>
        payments
            .filter(p => p?.userName === userName)
            .reduce((acc, curr) => acc + (curr?.monto ?? 0), 0);


    return (
        <div className="w-full px-2">
            {/* TABLE para pantallas grandes */}
            <div className="hidden sm:block overflow-x-auto rounded-lg shadow-md">
                <table className="min-w-full border-collapse border border-gray-300 text-sm md:text-base">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                            <th className="border px-2 py-2 text-left">Usuario</th>
                            {MESES.map(m => <th key={m} className="border px-2 py-2 text-center whitespace-nowrap">{m}</th>)}
                            <th className="border px-2 py-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u: User) => (
                            <tr key={u._id} className="even:bg-gray-50 hover:bg-blue-50 transition-colors">
                                <td className="border px-2 py-2 font-medium text-left whitespace-nowrap">{u.name}</td>
                                {MESES.map(m => (
                                    <td key={m} className="border px-2 py-1 text-center whitespace-nowrap">
                                        {getPagoPorMes(u.name, m) !== '' ? `$${getPagoPorMes(u.name, m)}` : '-'}
                                    </td>
                                ))}
                                <td className="border px-2 py-2 text-right font-semibold whitespace-nowrap">${getTotal(u.name)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* CARDS para móviles */}
            <div className="sm:hidden space-y-4 mt-4">
                {users.map((u: User) => (
                    <div key={u._id} className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
                        <h3 className="font-semibold text-lg text-gray-800 mb-2">{u.name}</h3>
                        <ul className="space-y-1 text-sm text-gray-700 max-h-40 overflow-y-auto">
                            {MESES.map(m => {
                                const pago = getPagoPorMes(u.name, m)
                                return (
                                    <li key={m} className="flex justify-between border-b last:border-b-0 pb-1">
                                        <span>{m}</span>
                                        <span className={pago ? "text-green-600 font-medium" : "text-gray-400"}>
                                            {pago ? `$${pago}` : '-'}
                                        </span>
                                    </li>
                                )
                            })}
                        </ul>
                        <p className="mt-3 text-right font-bold text-blue-600">Total: ${getTotal(u.name)}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default DataTable

