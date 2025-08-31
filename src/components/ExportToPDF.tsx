import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { usePayments } from '../hooks/usePayments'
import { useUsers } from '../hooks/useUsers'

export default function ExportToPDF() {
    const { payments, isLoading: paymentsLoading } = usePayments()
    const { users, isLoading: usersLoading } = useUsers()

    // ⚡️ Calcular resumen
    const totalRecaudado = payments.reduce((acc, curr) => acc + curr.monto, 0)
    const fondo = totalRecaudado
    const alquiler = 100000
    const restante = Math.max(alquiler - fondo, 0)

    const handleExportPDF = () => {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()

        // 📌 Título
        doc.setFontSize(16)
        doc.text('Reporte de Pagos - Solís 1154', pageWidth / 2, 20, { align: 'center' })

        // 📌 Columnas
        const columns = [
            { header: 'Usuario', dataKey: 'name' },
            { header: 'Mes', dataKey: 'mes' },
            { header: 'Monto', dataKey: 'monto' },
        ]

        // 📌 Construir el body: ahora usamos userName o userId
        const body = payments.map(p => {
            // Si tu backend devuelve userName directamente 👇
            if (p.userName) {
                return {
                    name: p.userName,
                    mes: p.mes,
                    monto: `$${p.monto}`,
                }
            }

            // Si solo trae userId, hacemos lookup en users
            const user = users.find(u => u._id === p.userId)
            return {
                name: user ? user.name : 'Desconocido',
                mes: p.mes,
                monto: `$${p.monto}`,
            }
        })

        autoTable(doc, {
            headStyles: { fillColor: [33, 150, 243] },
            startY: 30,
            columns,
            body,
        })

        // 📌 Resumen debajo de la tabla
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const resumenY = (doc as any).lastAutoTable.finalY + 10

        doc.setFontSize(12)
        doc.text(`Total Recaudado: $${totalRecaudado}`, 14, resumenY)
        doc.text(`Fondo Acumulado: $${fondo}`, 14, resumenY + 6)
        doc.text(`Pago de Alquiler: $${alquiler}`, 14, resumenY + 12)
        doc.text(`Resta por Pagar: $${restante}`, 14, resumenY + 18)

        doc.save('reporte-pagos.pdf')
    }

    if (paymentsLoading || usersLoading) {
        return <p className="text-center">Cargando datos...</p>
    }

    return (
        <div className="flex justify-center my-4">
            <button
                onClick={handleExportPDF}
                disabled={!payments.length}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
                title="Exportar pagos a PDF"
            >
                <span>📄</span>
                Exportar a PDF
            </button>
        </div>
    )
}
