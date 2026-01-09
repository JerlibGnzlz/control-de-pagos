import { useState } from 'react'
import { usePayments } from '../hooks/usePayments'
import { useUsers } from '../hooks/useUsers'
import { usePaymentCalculations } from '../hooks/usePaymentCalculations'
import Modal from './ui/Modal'
import ExportToPDF from './ExportToPDF'

export default function YearlyClosing() {
    const { payments, deleteAllPayments, isDeletingAll } = usePayments()
    const { users } = useUsers()
    const { alquilerMes, resetAlquileres } = usePaymentCalculations(users, payments)

    // Estado del modal de confirmación
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'danger' | 'warning' | 'info';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { },
    });

    const handleDownloadJSON = () => {
        const data = {
            timestamp: new Date().toISOString(),
            users,
            payments,
            config: {
                alquilerMes
            }
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `respaldo_pagos_${new Date().getFullYear()}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const handleCloseYear = () => {
        setModalConfig({
            isOpen: true,
            title: '⚠️ ¿Cerrar Año y Eliminar Todo?',
            message: 'Esta acción ELIMINARÁ PERMANENTEMENTE todos los pagos registrados y reseteará los valores de alquiler. Se recomienda descargar un respaldo antes. ¿Estás seguro?',
            type: 'danger',
            onConfirm: async () => {
                try {
                    // 1. Resetear configuración local
                    resetAlquileres()
                    // 2. Eliminar base de datos
                    await deleteAllPayments()
                    setModalConfig(prev => ({ ...prev, isOpen: false }))
                    alert('Año cerrado correctamente. Sistema reiniciado.')
                } catch (error) {
                    alert('Error al cerrar el año')
                }
            }
        })
    }

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 my-8">
            <Modal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                confirmText="🔥 SÍ, ELIMINAR TODO"
            />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        📦 Gestión de Cierre y Respaldos
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-lg">
                        Aquí puedes descargar toda la información del año actual y reiniciar el sistema para un nuevo ciclo. Asegúrate de guardar los respaldos.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Botón JSON */}
                    <button
                        onClick={handleDownloadJSON}
                        disabled={payments.length === 0}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <span>💾</span> Respaldo JSON
                    </button>

                    {/* Botón PDF */}
                    <div className="w-full sm:w-auto [&>div]:my-0">
                        <ExportToPDF />
                    </div>
                </div>
            </div>

            {/* Area de Acciones Peligrosas */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Zona de Peligro</h3>
                    <p className="text-xs text-gray-500">Acciones destructivas e irreversibles.</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <button
                        onClick={handleCloseYear}
                        disabled={payments.length === 0 || isDeletingAll}
                        className="w-full md:w-auto px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center justify-center gap-2"
                    >
                        {isDeletingAll ? 'Procesando...' : '⚠️ Cerrar Año (Borrar Todo)'}
                    </button>
                </div>
            </div>
        </div>
    )
}
