// import jsPDF from 'jspdf'
// import autoTable from 'jspdf-autotable'
// import { useUsers } from '../hooks/useUsers'

// export default function ExportToPDF() {
//     const { payments, fondo, alquiler } = usePaymentsnts()
//     const { users } = useUsers()

//     const handleExportPDF = () => {
//         const doc = new jsPDF()

//         const pageWidth = doc.internal.pageSize.getWidth()

//         // Título centrado
//         doc.setFontSize(16)
//         doc.text('Reporte de Pagos - Solís 1154', pageWidth / 2, 20, { align: 'center' })

//         // Columnas
//         const columns = [
//             { header: 'Usuario', dataKey: 'name' },
//             { header: 'Mes', dataKey: 'mes' },
//             { header: 'Monto', dataKey: 'monto' },
//         ]

//         // Construimos el body con el nombre real del usuario
//         const body = payments.map(p => {
//             // Buscar usuario por id (p.name)
//             const user = users.find(u => u._id === p.name)
//             return {
//                 name: user ? user.name : p.name, // si no lo encuentra, mostramos el código
//                 mes: p.mes,
//                 monto: `$${p.monto}`,
//             }
//         })

//         autoTable(doc, {
//             headStyles: { fillColor: [33, 150, 243] },
//             startY: 30,
//             columns,
//             body,
//         })

//         // Resumen debajo de la tabla
//         const totalRecaudado = payments.reduce((acc, curr) => acc + curr.monto, 0)
//         const restante = Math.max(alquiler - fondo, 0)

//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const resumenY = (doc as any).lastAutoTable.finalY + 10

//         doc.setFontSize(12)
//         doc.text(`Total Recaudado: $${totalRecaudado}`, 14, resumenY)
//         doc.text(`Fondo Acumulado: $${fondo}`, 14, resumenY + 6)
//         doc.text(`Pago de Alquiler: $${alquiler}`, 14, resumenY + 12)
//         doc.text(`Resta por Pagar: $${restante}`, 14, resumenY + 18)

//         // Guardar
//         doc.save('reporte-pagos.pdf')
//     }

//     return (
//         <div className="flex justify-center my-4">
//             <button
//                 onClick={handleExportPDF}
//                 className="w-full sm:w-auto  flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
//                 title="Exportar pagos a PDF"
//             >
//                 <span>📄</span>
//                 Exportar a PDF
//             </button>
//         </div>
//     )
// }

