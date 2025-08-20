import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { usePayments } from '../context/PaymentsContext'

export default function ExportButton() {
    const { payments } = usePayments()

    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(payments)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Pagos')

        const excelBuffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
        })

        const blob = new Blob([excelBuffer], {
            type:
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
        })

        saveAs(blob, 'pagos.xlsx')
    }

    return (
        <div className="flex justify-center mt-6 px-4">
            <button
                onClick={handleExport}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-200 hover:scale-105"
                title="Exportar pagos a archivo Excel"
            >
                <span className="text-xl">📤</span>
                <span>Exportar a Excel</span>
            </button>
        </div>

    )
}
