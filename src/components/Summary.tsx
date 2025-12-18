import { usePayments } from "../hooks/usePayments"
import { useUsers } from "../hooks/useUsers"
import { usePaymentCalculations } from "../hooks/usePaymentCalculations"

export default function Summary() {
    const { payments = [], isLoading: paymentsLoading } = usePayments()
    const { users, isLoading: usersLoading } = useUsers()

    // Obtener cálculos incluyendo saldo acumulado
    const {
        totalRecaudado,
        totalAlquiler
    } = usePaymentCalculations(users, payments)

    // Filtrar pagos válidos
    const pagosValidos = payments.filter(p => p?.monto != null)

    const MESES = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]

    const totalesPorMes = MESES.map(mes => {
        const total = pagosValidos
            .filter(p => p.mes && p.mes.toLowerCase() === mes.toLowerCase())
            .reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0)
        return { mes, total }
    }).filter(m => m.total > 0)

    const sumaMensualTotal = totalesPorMes.reduce((acc, mes) => acc + Number(mes.total), 0)

    // Dinero disponible (caja chica) = Total recaudado - Total de alquileres
    const cajaChica = totalRecaudado - totalAlquiler

    if (paymentsLoading || usersLoading) return <p className="text-center py-4 text-gray-600 dark:text-gray-300">Cargando resumen...</p>

    return (
        <section className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md transition-colors">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Resumen de Pagos
            </h3>

            {/* Caja Chica - DESTACADO */}
            <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-2 border-indigo-300 dark:border-indigo-600">
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">💰 Dinero Disponible (Caja Chica)</p>
                    <p className={`text-3xl font-bold ${cajaChica >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                        }`}>
                        {cajaChica >= 0 ? '+' : ''}${cajaChica.toLocaleString('es-AR')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        (Total recaudado - Total de alquileres)
                    </p>
                </div>
            </div>

            <div className="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
                <p className="flex justify-between items-center">
                    <span className="font-medium">Total recaudado:</span>
                    <span className="text-green-600 dark:text-green-400 font-bold text-lg">${totalRecaudado.toLocaleString('es-AR')}</span>
                </p>
                <p className="flex justify-between items-center">
                    <span className="font-medium">Total de alquileres:</span>
                    <span className="text-red-600 dark:text-red-400 font-bold text-lg">${totalAlquiler.toLocaleString('es-AR')}</span>
                </p>
                <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
                    <p className="flex justify-between items-center">
                        <span className="font-semibold">Diferencia:</span>
                        <span className={`font-bold text-xl ${cajaChica >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                            }`}>
                            {cajaChica >= 0 ? '+' : ''}${cajaChica.toLocaleString('es-AR')}
                        </span>
                    </p>
                </div>
            </div>

            <h4 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1">
                Total por mes:
            </h4>

            <ul className="mb-6 max-h-64 overflow-y-auto border rounded-md border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900/50">
                {totalesPorMes.map(({ mes, total }) => (
                    <li
                        key={mes}
                        className="flex justify-between text-gray-700 dark:text-gray-300 py-2 px-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <span className="font-medium">{mes}</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">${total.toLocaleString('es-AR')}</span>
                    </li>
                ))}
            </ul>

            <p className="text-center font-semibold text-lg sm:text-xl text-gray-900 dark:text-white">
                Total de sumas mensuales: <span className="text-purple-600 dark:text-purple-400">${sumaMensualTotal.toLocaleString('es-AR')}</span>
            </p>
        </section>
    )
}
