import { usePayments } from "../hooks/usePayments"

export default function Summary() {
    const { payments = [], isLoading } = usePayments()

    // Filtrar pagos válidos
    const pagosValidos = payments.filter(p => p?.monto != null)


    // Convertir monto a número seguro
    const totalRecaudado = pagosValidos.reduce((acc, curr) => {
        const monto = Number(curr.monto) || 0
        return acc + monto
    }, 0)

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

    if (isLoading) return <p className="text-center py-4">Cargando resumen...</p>

    return (
        <section className="max-w-lg mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Resumen de Pagos
            </h3>

            <div className="space-y-2 mb-6 text-gray-700">
                <p className="flex justify-between items-center">
                    <span className="font-medium">Total recaudado:</span>
                    <span className="text-green-600 font-bold text-lg">${totalRecaudado}</span>
                </p>
            </div>

            <h4 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800 border-b pb-1">
                Total por mes:
            </h4>

            <ul className="mb-6 max-h-64 overflow-y-auto border rounded-md border-gray-200 p-3 bg-gray-50">
                {totalesPorMes.map(({ mes, total }) => (
                    <li
                        key={mes}
                        className="flex justify-between text-gray-700 py-2 px-2 border-b last:border-b-0 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <span className="font-medium">{mes}</span>
                        <span className="font-semibold text-blue-600">${total}</span>
                    </li>
                ))}
            </ul>

            <p className="text-center font-semibold text-lg sm:text-xl text-gray-900">
                Total de sumas mensuales: <span className="text-purple-600">${sumaMensualTotal}</span>
            </p>
        </section>
    )
}
