import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { usePayments } from '../hooks/usePayments'
import { useUsers } from '../hooks/useUsers'
import { usePaymentCalculations } from '../hooks/usePaymentCalculations'
import { MESES } from './PaymentForm' // Importar meses constantes

export default function ExportToPDF() {
    const { payments, isLoading: paymentsLoading } = usePayments()
    const { users, isLoading: usersLoading } = useUsers()

    // Obtener cálculos reales de la aplicación
    const {
        totalRecaudado,
        totalAlquiler,
        totalSaldoAnterior,
        alquilerMes,
        getTotalPorMes,
        getTotalPorUsuario
    } = usePaymentCalculations(users, payments)

    const handleExportPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape' }) // Landscape para que quepan todos los meses
        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()

        // ==================== HEADER ====================
        doc.setFillColor(30, 58, 138) // Azul oscuro
        doc.rect(0, 0, pageWidth, 30, 'F')

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(18)
        doc.setFont('courier', 'bold') // Fuente mono para estilo contable
        doc.text('HOJA DE CONTABILIDAD - SALÓN SOLÍS 1154', pageWidth / 2, 12, { align: 'center' })

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text('Reporte Financiero Anual Detallado', pageWidth / 2, 20, { align: 'center' })

        // Fecha
        const fecha = new Date().toLocaleDateString('es-AR', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })
        doc.setFontSize(8)
        doc.text(fecha, pageWidth - 10, 8, { align: 'right' })

        // ==================== TABLA PRINCIPAL (GRID) ====================

        // 1. Preparar Columnas
        const columns = [
            { header: 'USUARIO', dataKey: 'usuario' },
            { header: 'VIENEN', dataKey: 'vienen' },
            ...MESES.map(m => ({ header: m.toUpperCase().substring(0, 3), dataKey: m })),
            { header: 'TOTAL', dataKey: 'total' }
        ]

        // 2. Preparar Datos de Usuarios
        const data = users.map(u => {
            const row: any = {
                usuario: u.name,
                vienen: (u.saldoAnterior || 0) > 0 ? `$${(u.saldoAnterior || 0).toLocaleString('es-AR')}` : '-',
                total: `$${(getTotalPorUsuario(u.name) + (u.saldoAnterior || 0)).toLocaleString('es-AR')}`
            }
            MESES.forEach(mes => {
                const pago = payments.find(p => p.userName?.toLowerCase() === u.name.toLowerCase() && p.mes === mes)?.monto || 0
                row[mes] = pago > 0 ? `$${pago.toLocaleString('es-AR')}` : '-'
            })
            return row
        })

        // 3. Preparar Filas del Pie (Totales / Contabilidad)

        // Fila 1: SALDO INICIAL (Mostrando el 361k forzado si es necesario)
        const saldoInicialRow: any = { usuario: 'SALDO INICIAL', vienen: `$${(totalSaldoAnterior > 0 ? totalSaldoAnterior : 361000).toLocaleString('es-AR')}` }
        MESES.forEach(m => saldoInicialRow[m] = '') // Empty for months
        saldoInicialRow.total = ''

        // Fila 2: CALCULO SALDO (Running Balance)
        const calculoRow: any = { usuario: 'CALCULO SALDO', vienen: `$${(totalSaldoAnterior > 0 ? totalSaldoAnterior : 361000).toLocaleString('es-AR')}` }
        let runningIncome = 0
        MESES.forEach((m) => {
            // Calculate running income correctly
            runningIncome += getTotalPorMes(m)
            const currentBalance = (totalSaldoAnterior > 0 ? totalSaldoAnterior : 361000) + runningIncome
            calculoRow[m] = `$${currentBalance.toLocaleString('es-AR')}`
        })
        calculoRow.total = `$${((totalSaldoAnterior > 0 ? totalSaldoAnterior : 361000) + totalRecaudado).toLocaleString('es-AR')}`

        // Fila 3: GASTOS
        const gastosRow: any = { usuario: 'GASTOS POR MES', vienen: '-' }
        MESES.forEach((m, idx) => {
            const gasto = alquilerMes[idx] || 0
            gastosRow[m] = gasto > 0 ? `$${gasto.toLocaleString('es-AR')}` : '-'
        })
        gastosRow.total = `$${totalAlquiler.toLocaleString('es-AR')}`

        // Fila 4: SALDO DISPONIBLE
        const disponibleRow: any = { usuario: 'SALDO DISPONIBLE', vienen: `$${(totalSaldoAnterior > 0 ? totalSaldoAnterior : 361000).toLocaleString('es-AR')}` }
        let runningExp = 0
        let runningInc = 0
        MESES.forEach((m, idx) => {
            runningInc += getTotalPorMes(m)
            runningExp += (alquilerMes[idx] || 0)
            const available = ((totalSaldoAnterior > 0 ? totalSaldoAnterior : 361000) + runningInc) - runningExp
            disponibleRow[m] = `$${available.toLocaleString('es-AR')}`
        })
        disponibleRow.total = `$${((totalSaldoAnterior > 0 ? totalSaldoAnterior : 361000) + totalRecaudado - totalAlquiler).toLocaleString('es-AR')}`


        // Generar Tabla
        autoTable(doc, {
            startY: 35,
            head: [columns.map(c => c.header)],
            body: data.map(row => columns.map(c => row[c.dataKey])),
            foot: [
                columns.map(c => calculoRow[c.dataKey]), // Calculo Saldo
                columns.map(c => gastosRow[c.dataKey]), // Gastos
                columns.map(c => disponibleRow[c.dataKey]) // Disponible
            ],
            theme: 'grid',
            styles: {
                fontSize: 8,
                cellPadding: 2,
                font: 'courier', // Monospaced numbers
                halign: 'right', // Numbers aligned right
                lineColor: [200, 200, 200],
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: [30, 58, 138],
                textColor: [255, 255, 255],
                halign: 'center',
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { halign: 'left', fontStyle: 'bold', cellWidth: 40 }, // Usuario column
                1: { fontStyle: 'bold', textColor: [30, 58, 138] }, // Vienen
                14: { fontStyle: 'bold', fillColor: [240, 240, 240] } // Total column
            },
            footStyles: {
                fillColor: [240, 248, 255],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                halign: 'right'
            },
            didParseCell: (data) => {
                // Colorize Footer Rows
                if (data.section === 'foot') {
                    if (data.row.index === 0) { // Calculo Saldo
                        data.cell.styles.fillColor = [219, 234, 254] // Blue light
                        data.cell.styles.textColor = [30, 58, 138]
                        if (data.column.index === 0) data.cell.text = ['CALCULO SALDO']
                    }
                    if (data.row.index === 1) { // Gastos
                        data.cell.styles.fillColor = [254, 252, 231] // Yellow light
                        data.cell.styles.textColor = [180, 83, 9] // Dark yellow/orange
                        if (data.column.index === 0) data.cell.text = ['GASTOS POR MES']
                    }
                    if (data.row.index === 2) { // Disponible
                        data.cell.styles.fillColor = [220, 252, 231] // Green light
                        data.cell.styles.textColor = [21, 128, 61] // Green dark
                        if (data.column.index === 0) data.cell.text = ['SALDO DISPONIBLE']
                    }
                }
            }
        })

        // ==================== ESTADO FINAL ====================
        const finalY = (doc as any).lastAutoTable.finalY + 10
        const totalDisponible = (totalSaldoAnterior > 0 ? totalSaldoAnterior : 361000) + totalRecaudado - totalAlquiler

        doc.setFillColor(totalDisponible >= 0 ? 220 : 254, totalDisponible >= 0 ? 252 : 226, totalDisponible >= 0 ? 231 : 226)
        doc.roundedRect(pageWidth / 2 - 40, finalY, 80, 20, 2, 2, 'F')

        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text('SALDO FINAL EN CAJA', pageWidth / 2, finalY + 8, { align: 'center' })

        doc.setFontSize(14)
        doc.setTextColor(totalDisponible >= 0 ? 21 : 220, totalDisponible >= 0 ? 128 : 38, totalDisponible >= 0 ? 61 : 38)
        doc.text(`$${totalDisponible.toLocaleString('es-AR')}`, pageWidth / 2, finalY + 16, { align: 'center' })


        // Pie
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text('Generado por Sistema de Pagos Salón Solís', 10, pageHeight - 10)

        // Guardar PDF
        const nombreArchivo = `Contabilidad_Salon_${new Date().toLocaleDateString('es-AR').replace(/\//g, '-')}.pdf`
        doc.save(nombreArchivo)
    }

    if (paymentsLoading || usersLoading) return <p className="text-center text-gray-600 dark:text-gray-300">Cargando...</p>

    return (
        <div className="flex justify-center my-4">
            <button
                onClick={handleExportPDF}
                disabled={!payments.length}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-lg transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl uppercase tracking-wider border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1"
                title="Descargar Hoja de Contabilidad en PDF"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Descargar Hoja Contable PDF</span>
            </button>
        </div>
    )
}
