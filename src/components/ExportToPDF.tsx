import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { usePayments } from '../hooks/usePayments'
import { useUsers } from '../hooks/useUsers'
import { usePaymentCalculations } from '../hooks/usePaymentCalculations'

export default function ExportToPDF() {
    const { payments, isLoading: paymentsLoading } = usePayments()
    const { users, isLoading: usersLoading } = useUsers()

    // Obtener cálculos reales de la aplicación
    const {
        totalRecaudado,
        totalAlquiler,
        saldosAcumulados
    } = usePaymentCalculations(users, payments)

    const handleExportPDF = () => {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()
        let yPos = 20

        // ==================== HEADER ====================
        // Fondo del header
        doc.setFillColor(67, 56, 202) // Indigo
        doc.rect(0, 0, pageWidth, 35, 'F')

        // Título principal
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(20)
        doc.setFont('helvetica', 'bold')
        doc.text('REPORTE FINANCIERO', pageWidth / 2, 15, { align: 'center' })

        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.text('Sistema de Pago de Alquiler - Salón Solís 1154', pageWidth / 2, 25, { align: 'center' })

        // Fecha de generación
        const fecha = new Date().toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        doc.setTextColor(100, 100, 100)
        doc.setFontSize(9)
        doc.text(`Generado: ${fecha}`, pageWidth - 14, 10, { align: 'right' })

        yPos = 45

        // ==================== RESUMEN EJECUTIVO ====================
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('📊 Resumen Ejecutivo', 14, yPos)
        yPos += 10

        // Tarjetas de resumen
        const cardWidth = (pageWidth - 42) / 3
        const cardHeight = 25
        const startX = 14

        // Función para formatear moneda
        const formatMoney = (amount: number) => {
            return `$${amount.toLocaleString('es-AR')}`
        }

        const cajaChica = totalRecaudado - totalAlquiler

        // Tarjeta 1: Total Recaudado
        doc.setFillColor(220, 252, 231) // Verde claro
        doc.roundedRect(startX, yPos, cardWidth, cardHeight, 3, 3, 'F')
        doc.setFontSize(9)
        doc.setTextColor(21, 128, 61) // Verde oscuro
        doc.text('Total Recaudado', startX + 5, yPos + 7)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(formatMoney(totalRecaudado), startX + 5, yPos + 17)

        // Tarjeta 2: Total Alquileres
        doc.setFillColor(254, 226, 226) // Rojo claro
        doc.roundedRect(startX + cardWidth + 7, yPos, cardWidth, cardHeight, 3, 3, 'F')
        doc.setFontSize(9)
        doc.setTextColor(185, 28, 28) // Rojo oscuro
        doc.text('Total Alquileres', startX + cardWidth + 12, yPos + 7)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(formatMoney(totalAlquiler), startX + cardWidth + 12, yPos + 17)

        // Tarjeta 3: Caja Chica
        const cajaColor = cajaChica >= 0 ? [220, 252, 231] : [254, 226, 226]
        const cajaTextColor = cajaChica >= 0 ? [21, 128, 61] : [185, 28, 28]
        doc.setFillColor(...cajaColor)
        doc.roundedRect(startX + (cardWidth + 7) * 2, yPos, cardWidth, cardHeight, 3, 3, 'F')
        doc.setFontSize(9)
        doc.setTextColor(...cajaTextColor)
        doc.text('💰 Caja Chica', startX + (cardWidth + 7) * 2 + 5, yPos + 7)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        const cajaText = cajaChica >= 0 ? `+${formatMoney(cajaChica)}` : formatMoney(cajaChica)
        doc.text(cajaText, startX + (cardWidth + 7) * 2 + 5, yPos + 17)

        yPos += cardHeight + 15

        // ==================== TABLA DE PAGOS POR USUARIO ====================
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('👥 Detalle de Pagos por Usuario', 14, yPos)
        yPos += 5

        // Agrupar pagos por usuario
        const pagosPorUsuario = users
            .map(u => {
                const pagosUsuario = payments
                    .filter(p => p.userId === u._id)
                    .map(p => ({ mes: p.mes, monto: p.monto }))
                    .sort((a, b) => {
                        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
                        return meses.indexOf(a.mes) - meses.indexOf(b.mes)
                    })

                const total = pagosUsuario.reduce((acc, p) => acc + p.monto, 0)

                return {
                    name: u.name,
                    total,
                    pagos: pagosUsuario,
                }
            })
            .filter(u => u.total > 0)
            .sort((a, b) => b.total - a.total) // Ordenar por mayor contribución

        // Preparar datos para la tabla
        const tableData: any[] = []
        pagosPorUsuario.forEach((u, index) => {
            // Fila del usuario
            tableData.push({
                usuario: u.name,
                detalle: `${u.pagos.length} pago(s)`,
                monto: formatMoney(u.total),
                tipo: 'usuario',
                index: index
            })
            // Filas de meses
            u.pagos.forEach(p => {
                tableData.push({
                    usuario: '',
                    detalle: `    └─ ${p.mes}`,
                    monto: formatMoney(p.monto),
                    tipo: 'mes',
                    index: index
                })
            })
        })

        autoTable(doc, {
            startY: yPos,
            head: [['Usuario', 'Detalle', 'Monto']],
            body: tableData.map(row => [row.usuario, row.detalle, row.monto]),
            headStyles: {
                fillColor: [67, 56, 202], // Indigo
                textColor: [255, 255, 255],
                fontSize: 11,
                fontStyle: 'bold',
                halign: 'left'
            },
            columnStyles: {
                0: { cellWidth: 50, fontStyle: 'bold' },
                1: { cellWidth: 80 },
                2: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
            },
            styles: {
                fontSize: 10,
                cellPadding: 4,
                lineColor: [220, 220, 220],
                lineWidth: 0.1
            },
            didParseCell: function (data) {
                const rowData = tableData[data.row.index]
                if (rowData && rowData.tipo === 'usuario') {
                    // Fila de usuario
                    data.cell.styles.fillColor = [249, 250, 251]
                    data.cell.styles.textColor = [0, 0, 0]
                } else if (rowData && rowData.tipo === 'mes') {
                    // Fila de mes
                    data.cell.styles.fillColor = [255, 255, 255]
                    data.cell.styles.textColor = [100, 100, 100]
                    data.cell.styles.fontStyle = 'normal'
                }
            },
            margin: { left: 14, right: 14 }
        })

        // ==================== RESUMEN FINAL ====================
        const finalY = (doc as any).lastAutoTable.finalY + 15

        // Verificar si necesitamos una nueva página
        if (finalY > pageHeight - 60) {
            doc.addPage()
            yPos = 20
        } else {
            yPos = finalY
        }

        // Línea separadora
        doc.setDrawColor(200, 200, 200)
        doc.line(14, yPos - 5, pageWidth - 14, yPos - 5)

        // Resumen final en caja
        doc.setFillColor(245, 245, 245)
        doc.roundedRect(14, yPos, pageWidth - 28, 45, 3, 3, 'F')

        doc.setTextColor(0, 0, 0)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('💼 Resumen Financiero Final', 20, yPos + 10)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)

        const resumenLines = [
            { label: 'Total Recaudado:', value: formatMoney(totalRecaudado), color: [22, 163, 74] },
            { label: 'Total Alquileres:', value: formatMoney(totalAlquiler), color: [220, 38, 38] },
            { label: 'Balance Final (Caja Chica):', value: cajaText, color: cajaChica >= 0 ? [22, 163, 74] : [220, 38, 38] }
        ]

        let lineY = yPos + 20
        resumenLines.forEach(line => {
            doc.setTextColor(60, 60, 60)
            doc.text(line.label, 25, lineY)
            doc.setTextColor(...line.color)
            doc.setFont('helvetica', 'bold')
            doc.text(line.value, pageWidth - 25, lineY, { align: 'right' })
            doc.setFont('helvetica', 'normal')
            lineY += 7
        })

        // Estado financiero
        yPos += 50
        doc.setFontSize(9)
        doc.setTextColor(100, 100, 100)
        const estado = cajaChica >= 0
            ? '✅ Estado: SUPERÁVIT - Hay fondos disponibles'
            : '⚠️ Estado: DÉFICIT - Se requieren fondos adicionales'
        doc.text(estado, 20, yPos)

        // ==================== PIE DE PÁGINA ====================
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text('Sistema de Gestión de Pagos - Salón Solís 1154', pageWidth / 2, pageHeight - 15, { align: 'center' })
        doc.text(`Página 1 de 1`, pageWidth / 2, pageHeight - 10, { align: 'center' })

        // Guardar PDF
        const nombreArchivo = `Reporte_Pagos_${new Date().toLocaleDateString('es-AR').replace(/\//g, '-')}.pdf`
        doc.save(nombreArchivo)
    }

    if (paymentsLoading || usersLoading) return <p className="text-center text-gray-600 dark:text-gray-300">Cargando datos...</p>

    return (
        <div className="flex justify-center my-4">
            <button
                onClick={handleExportPDF}
                disabled={!payments.length}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                title="Exportar pagos a PDF profesional"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                <span>📄 Exportar PDF Profesional</span>
            </button>
        </div>
    )
}
