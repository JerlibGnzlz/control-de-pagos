import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { usePayments } from '../hooks/usePayments'
import { useUsers } from '../hooks/useUsers'

export default function ExportToPDF() {
    const { payments, isLoading: paymentsLoading } = usePayments()
    const { users, isLoading: usersLoading } = useUsers()

    // ⚡️ Agrupar pagos por usuario y por mes
    const pagosPorUsuario = users
        .map(u => {
            const pagosUsuario = payments
                .filter(p => p.userId === u._id)
                .map(p => ({ mes: p.mes, monto: p.monto }))

            const total = pagosUsuario.reduce((acc, p) => acc + p.monto, 0)

            return {
                name: u.name,
                total,
                pagos: pagosUsuario,
            }
        })
        .filter(u => u.total > 0)

    const totalRecaudado = pagosPorUsuario.reduce((acc, u) => acc + u.total, 0)
    const fondo = totalRecaudado
    const alquiler = 100000
    const restante = Math.max(alquiler - fondo, 0)

    const handleExportPDF = () => {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()

        doc.setFontSize(16)
        doc.text('Reporte de Pagos por Usuario - Solís 1154', pageWidth / 2, 20, { align: 'center' })

        const columns = [
            { header: 'Usuario / Mes', dataKey: 'name' },
            { header: 'Monto', dataKey: 'total' },
        ]

        // Colores únicos para usuarios
        const colores: [number, number, number][] = [
            [255, 99, 71],   // rojo
            [60, 179, 113],  // verde
            [65, 105, 225],  // azul
            [255, 165, 0],   // naranja
            [147, 112, 219], // púrpura
            [0, 206, 209],   // cian
        ]

        // Determinar el pago máximo para escala de barra
        const montoMaximo = Math.max(...pagosPorUsuario.flatMap(u => u.pagos.map(p => p.monto)))

        const body: { name: string; total: string; isSubRow?: boolean; colorIndex?: number; monto?: number }[] = []

        pagosPorUsuario.forEach((u, index) => {
            const colorIndex = index % colores.length
            body.push({ name: u.name, total: `$${u.total}`, isSubRow: false, colorIndex, monto: u.total })
            u.pagos.forEach(p => {
                body.push({ name: `   ${p.mes}`, total: `$${p.monto}`, isSubRow: true, colorIndex, monto: p.monto })
            })
        })

        autoTable(doc, {
            startY: 30,
            columns,
            body,
            headStyles: { fillColor: [33, 150, 243], textColor: 255 },
            columnStyles: { total: { halign: 'right' } },
            styles: { cellPadding: 3, fontSize: 11, lineColor: [200, 200, 200], lineWidth: 0.2 },
            didParseCell: (data) => {
                const raw = data.cell.raw as { colorIndex?: number; isSubRow?: boolean; monto?: number } || {};
                const color = raw.colorIndex !== undefined ? colores[raw.colorIndex] : [0, 0, 0]

                if (typeof data.cell.raw === 'object' && data.cell.raw !== null && (data.cell.raw as { isSubRow?: boolean }).isSubRow) {
                    data.cell.styles.fillColor = [240, 240, 240]
                    data.cell.styles.fontStyle = 'normal'
                    if (data.column.dataKey === 'name') {
                        const [r, g, b] = color.map(c => Math.min(c + 100, 255))
                        data.cell.styles.textColor = [r, g, b]
                    } else {
                        data.cell.styles.textColor = 80
                    }
                } else {
                    data.cell.styles.fillColor = [255, 255, 255]
                    data.cell.styles.fontStyle = 'bold'
                    if (data.column.dataKey === 'name') {
                        data.cell.styles.textColor = color as [number, number, number]
                    } else {
                        data.cell.styles.textColor = 0
                    }
                }
            },
            didDrawCell: (data) => {
                // Dibujar barra proporcional solo en la columna de "Monto"
                if (
                    data.column.dataKey === 'total' &&
                    typeof data.cell.raw === 'object' &&
                    data.cell.raw !== null &&
                    'monto' in data.cell.raw
                ) {
                    const raw = data.cell.raw as { monto: number; colorIndex?: number }
                    const { x, y, width, height } = data.cell
                    const barWidth = (raw.monto / montoMaximo) * width
                    const color = colores[raw.colorIndex || 0]

                    doc.setFillColor(...color)
                    doc.rect(x, y + 2, barWidth, height - 4, 'F')
                }
            },
            margin: { top: 30 },
        })

        const resumenY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
        doc.setFontSize(12)
        doc.text(`Total Recaudado: $${totalRecaudado}`, 14, resumenY)
        doc.text(`Fondo Acumulado: $${fondo}`, 14, resumenY + 6)
        doc.text(`Pago de Alquiler: $${alquiler}`, 14, resumenY + 12)
        doc.text(`Resta por Pagar: $${restante}`, 14, resumenY + 18)

        doc.save('reporte-pagos-dashboard.pdf')
    }

    if (paymentsLoading || usersLoading) return <p className="text-center">Cargando datos...</p>

    return (
        <div className="flex justify-center my-4">
            <button
                onClick={handleExportPDF}
                disabled={!payments.length}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
                title="Exportar pagos a PDF"
            >
                <span>Exportar a PDF</span>
            </button>
        </div>
    )
}
