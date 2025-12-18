import { useState } from 'react'
import { useUsers } from '../hooks/useUsers'
import { usePayments } from '../hooks/usePayments'
import { usePaymentCalculations } from '../hooks/usePaymentCalculations'
import { MESES } from './PaymentForm'
import type { User, Payment } from '../types/payment'
import Modal from './ui/Modal'
import EditPaymentModal from './EditPaymentModal'

const DataTable = () => {
    const { users } = useUsers()
    const {
        payments,
        updatePayment,
        deletePayment,
        isUpdating,
        isDeleting
    } = usePayments()

    // Estado del Modal de Confirmación Generica
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'danger' | 'warning' | 'info';
        confirmText?: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { },
    });

    // Estado del Modal de Edición de Pago
    const [editConfig, setEditConfig] = useState<{
        isOpen: boolean;
        payment: Payment | null;
    }>({
        isOpen: false,
        payment: null
    });

    const {
        alquilerMes,
        handleAlquilerChange,
        getPagoPorMes,
        getTotalPorUsuario,
        getTotalPorMes,
        saldosAcumulados,
        totalRecaudado,
        totalAlquiler
    } = usePaymentCalculations(users, payments)

    const shortMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const handleResetClick = () => {
        setModalConfig({
            isOpen: true,
            title: 'Resetear Alquileres',
            message: '¿Estás seguro que deseas resetear todos los montos de alquiler a $0? Esta acción no se puede deshacer.',
            type: 'warning',
            confirmText: 'Sí, resetear',
            onConfirm: () => {
                MESES.forEach((_, idx) => handleAlquilerChange(idx, 0));
                setModalConfig(prev => ({ ...prev, isOpen: false })); // Close modal after confirm
            }
        });
    };

    const handleCellClick = (user: User, month: string) => {
        // Encontrar el pago correspondiente
        // Nota: busco por userId preferentemente, o fallback a nombre temporalmente por compatibilidad
        const payment = payments.find(p =>
            (p.userId === user._id || (!p.userId && p.userName === user.name)) &&
            p.mes === month
        );

        if (payment) {
            setEditConfig({
                isOpen: true,
                payment
            });
        }
    };

    const handleSavePayment = async (amount: number) => {
        if (!editConfig.payment) return;
        try {
            await updatePayment({ id: editConfig.payment._id, monto: amount });
            setEditConfig({ isOpen: false, payment: null });
        } catch (error) {
            alert('Error al actualizar el pago'); // Fallback simple o podría usar el Modal de error
        }
    };

    const handleDeletePayment = async () => {
        if (!editConfig.payment) return;

        // Confirmación adicional con el modal generico
        setModalConfig({
            isOpen: true,
            title: 'Eliminar Pago',
            message: `¿Estás seguro que deseas eliminar el pago de ${editConfig.payment.userName} del mes de ${editConfig.payment.mes}?`,
            type: 'danger',
            confirmText: 'Eliminar',
            onConfirm: async () => {
                try {
                    if (editConfig.payment) {
                        await deletePayment(editConfig.payment._id);
                    }
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                    setEditConfig({ isOpen: false, payment: null });
                } catch (error) {
                    alert('Error al eliminar el pago');
                }
            }
        });
    };

    return (
        <div className="w-full flex flex-col items-center gap-6">
            <Modal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                confirmText={modalConfig.confirmText}
            />

            {editConfig.payment && (
                <EditPaymentModal
                    isOpen={editConfig.isOpen}
                    onClose={() => setEditConfig({ isOpen: false, payment: null })}
                    onSave={handleSavePayment}
                    onDelete={handleDeletePayment}
                    initialAmount={Number(editConfig.payment.monto)}
                    userName={editConfig.payment.userName}
                    month={editConfig.payment.mes}
                    isProcessing={isUpdating || isDeleting}
                />
            )}

            {/* ==============================================
                VISTA MÓVIL Y TABLET (< 1024px)
                Se muestra como tarjetas para evitar scroll horizontal
               ============================================== */}
            <div className="w-full lg:hidden space-y-6">

                {/* 1. Tarjeta de Configuración de Alquileres (Versión Móvil) */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-yellow-200 dark:border-yellow-900/50">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            ✏️ Configuración de Alquileres
                        </h3>
                        <button
                            onClick={handleResetClick}
                            className="text-xs px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded transition-colors font-medium"
                        >
                            Resetear
                        </button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {MESES.map((m, idx) => (
                            <div key={m} className="flex flex-col">
                                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">{shortMonths[idx]}</span>
                                <input
                                    type="number"
                                    value={alquilerMes[idx] || ''}
                                    onChange={(e) => handleAlquilerChange(idx, Number(e.target.value))}
                                    className="w-full text-center border-2 border-yellow-100 dark:border-yellow-900 focus:border-yellow-400 dark:focus:border-yellow-500 rounded p-1 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white font-semibold outline-none transition-colors"
                                    placeholder="0"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 text-right">
                        <span className="text-xs text-gray-500 mr-2">Total Alquileres:</span>
                        <span className="font-bold text-red-600 dark:text-red-400">${totalAlquiler.toLocaleString('es-AR')}</span>
                    </div>
                </div>

                {/* 2. Lista de Usuarios (Tarjetas) */}
                <div className="space-y-4">
                    {users.map(u => (
                        <div key={u._id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-indigo-500 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900 dark:text-white truncate max-w-[150px]">{u.name}</h4>
                                    <p className="text-xs text-gray-500">Monto total pagado</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                        ${getTotalPorUsuario(u.name).toLocaleString('es-AR')}
                                    </span>
                                </div>
                            </div>

                            {/* Grilla de meses */}
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                {MESES.map((m, idx) => {
                                    const pago = getPagoPorMes(u.name, m);
                                    return (
                                        <div
                                            key={m}
                                            onClick={() => handleCellClick(u, m)}
                                            className={`flex flex-col items-center justify-center p-1.5 rounded-md text-center transition-all cursor-pointer ${pago > 0
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 shadow-sm hover:scale-105 active:scale-95'
                                                    : 'bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-700'
                                                }`}>
                                            <span className="text-[10px] font-bold uppercase mb-0.5">{shortMonths[idx]}</span>
                                            {pago > 0 ? (
                                                <span className="text-[10px] font-bold tracking-tighter">${(pago / 1000).toFixed(0)}k</span>
                                            ) : (
                                                <span className="text-[10px] opacity-50">-</span>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ==============================================
                VISTA DESKTOP (>= 1024px)
                Tabla condensada y optimizada para no scroll
               ============================================== */}
            <div className="hidden lg:block w-full overflow-x-auto rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs md:text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
                        <tr>
                            <th className="border-b border-r border-gray-300 dark:border-gray-600 p-2 text-left text-gray-900 dark:text-white font-bold w-32">Usuario</th>
                            {shortMonths.map(m => (
                                <th key={m} className="border-b border-gray-300 dark:border-gray-600 p-1 text-center font-semibold text-gray-700 dark:text-gray-300 w-auto">{m}</th>
                            ))}
                            <th className="border-b border-l border-gray-300 dark:border-gray-600 p-2 text-right text-gray-900 dark:text-white font-bold w-24">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u: User) => (
                            <tr key={u._id} className="even:bg-gray-50 dark:even:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                                <td className="border-b border-r border-gray-300 dark:border-gray-600 px-2 py-1.5 font-medium text-left truncate text-gray-900 dark:text-white max-w-[120px]" title={u.name}>{u.name}</td>
                                {MESES.map((m) => {
                                    const pago = getPagoPorMes(u.name, m)
                                    return (
                                        <td
                                            key={m}
                                            onClick={() => handleCellClick(u, m)}
                                            className={`border-b border-gray-300 dark:border-gray-600 px-1 py-1 text-center transition-colors cursor-pointer hover:opacity-80 ${pago > 0
                                                ? 'bg-green-100/50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-semibold hover:bg-green-200 dark:hover:bg-green-900/40'
                                                : 'text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                            title={pago > 0 ? "Click para editar" : ""}
                                        >
                                            {pago ? `$${pago.toLocaleString('es-AR')}` : '-'}
                                        </td>
                                    )
                                })}
                                <td className="border-b border-l border-gray-300 dark:border-gray-600 px-2 py-1.5 text-right font-bold text-indigo-600 dark:text-indigo-400">${getTotalPorUsuario(u.name).toLocaleString('es-AR')}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-700/50 font-semibold text-xs">
                        {/* Total recaudado */}
                        <tr className="bg-green-50 dark:bg-green-900/20">
                            <td className="border-t border-r border-gray-300 dark:border-gray-600 px-2 py-2 text-left text-gray-900 dark:text-white font-bold">Total Recaudado</td>
                            {MESES.map((mes, idx) => {
                                const totalMes = getTotalPorMes(mes)
                                const alquiler = alquilerMes[idx]
                                const colorClass = totalMes >= alquiler
                                    ? 'text-green-600 dark:text-green-400 font-bold'
                                    : 'text-red-500 dark:text-red-400'
                                return (
                                    <td key={mes} className={`border-t border-gray-300 dark:border-gray-600 px-1 py-2 text-center ${colorClass}`}>
                                        ${totalMes.toLocaleString('es-AR')}
                                    </td>
                                )
                            })}
                            <td className={`border-t border-l border-gray-300 dark:border-gray-600 px-2 py-2 text-right font-bold ${totalRecaudado >= totalAlquiler ? 'text-green-600' : 'text-red-600'}`}>
                                ${totalRecaudado.toLocaleString('es-AR')}
                            </td>
                        </tr>

                        {/* Pago de alquiler */}
                        <tr className="bg-yellow-50 dark:bg-yellow-900/20">
                            <td className="border-t border-r border-gray-300 dark:border-gray-600 px-2 py-2 text-left">
                                <div className="flex flex-col">
                                    <span className="text-gray-900 dark:text-white font-bold">✏️ Alquiler</span>
                                    <span className="text-[10px] text-gray-500">(Clic para editar)</span>
                                </div>
                            </td>
                            {MESES.map((m) => (
                                <td key={m} className="border-t border-gray-300 dark:border-gray-600 p-1 text-center">
                                    <input
                                        type="number"
                                        min="0"
                                        step="1000"
                                        placeholder="0"
                                        className="w-full text-center bg-transparent border-b border-dashed border-gray-400 focus:border-yellow-500 focus:outline-none text-gray-900 dark:text-white font-semibold hover:bg-white/50 dark:hover:bg-black/20 rounded-sm"
                                        value={alquilerMes[MESES.indexOf(m)] || ''}
                                        onChange={e => handleAlquilerChange(MESES.indexOf(m), Number(e.target.value))}
                                    />
                                </td>
                            ))}
                            <td className="border-t border-l border-gray-300 dark:border-gray-600 px-2 py-2 text-right">
                                <div className="flex flex-col items-end">
                                    <span className="text-gray-900 dark:text-white font-bold">${totalAlquiler.toLocaleString('es-AR')}</span>
                                    <button
                                        onClick={handleResetClick}
                                        className="text-[10px] text-red-500 hover:text-red-700 underline cursor-pointer"
                                    >
                                        Resetear
                                    </button>
                                </div>
                            </td>
                        </tr>

                        {/* Balance mensual */}
                        <tr className="bg-purple-50 dark:bg-purple-900/20">
                            <td className="border-t border-r border-gray-300 dark:border-gray-600 px-2 py-2 text-left text-gray-900 dark:text-white font-bold">Balance Mes</td>
                            {MESES.map((mes, idx) => {
                                const recaudado = getTotalPorMes(mes);
                                const alquiler = alquilerMes[idx] || 0;
                                const diferencia = recaudado - alquiler;
                                return (
                                    <td key={idx} className={`border-t border-gray-300 dark:border-gray-600 px-1 py-2 text-center font-bold ${diferencia >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                        }`}>
                                        {diferencia >= 0 ? '+' : ''}${diferencia.toLocaleString('es-AR')}
                                    </td>
                                );
                            })}
                            <td className={`border-t border-l border-gray-300 dark:border-gray-600 px-2 py-2 text-right font-bold ${(totalRecaudado - totalAlquiler) >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {(totalRecaudado - totalAlquiler) >= 0 ? '+' : ''}${(totalRecaudado - totalAlquiler).toLocaleString('es-AR')}
                            </td>
                        </tr>

                        {/* Saldo acumulado */}
                        <tr className="bg-blue-50 dark:bg-blue-900/20">
                            <td className="border-t border-r border-gray-300 dark:border-gray-600 px-2 py-2 text-left text-gray-900 dark:text-white font-bold">Saldo Acum.</td>
                            {saldosAcumulados.map((saldo, idx) => (
                                <td key={idx} className={`border-t border-gray-300 dark:border-gray-600 px-1 py-2 text-center font-bold ${saldo >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
                                    }`}>
                                    {saldo >= 0 ? '' : ''}${saldo.toLocaleString('es-AR')}
                                </td>
                            ))}
                            <td className={`border-t border-l border-gray-300 dark:border-gray-600 px-2 py-2 text-right font-extrabold text-sm ${saldosAcumulados[saldosAcumulados.length - 1] >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
                                }`}>
                                ${saldosAcumulados[saldosAcumulados.length - 1]?.toLocaleString('es-AR') || '0'}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Tarjeta de Resumen Financiero (Visible en todo) */}
            <div className="w-full p-5 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/40 dark:to-blue-900/40 border-2 border-indigo-200 dark:border-indigo-700 shadow-lg">
                <h4 className="text-center text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    📊 Resumen Financiero Total
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Recaudado */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Recaudado</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            ${totalRecaudado.toLocaleString('es-AR')}
                        </p>
                    </div>

                    {/* Total Alquileres */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Alquileres</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                            ${totalAlquiler.toLocaleString('es-AR')}
                        </p>
                    </div>

                    {/* Caja Chica */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-2 border-yellow-400 dark:border-yellow-500">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">💰 Caja Chica Disponible</p>
                        <p className={`text-2xl font-bold ${(totalRecaudado - totalAlquiler) >= 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                            {(totalRecaudado - totalAlquiler) >= 0 ? '+' : ''}${(totalRecaudado - totalAlquiler).toLocaleString('es-AR')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {(totalRecaudado - totalAlquiler) >= 0 ? '✅ Hay fondos disponibles' : '⚠️ Déficit acumulado'}
                        </p>
                    </div>
                </div>

                {/* Barra de progreso visual */}
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                        <span>Porcentaje cubierto del alquiler:</span>
                        <span className="font-semibold">
                            {totalAlquiler > 0 ? ((totalRecaudado / totalAlquiler) * 100).toFixed(1) : 0}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                            className={`h-3 rounded-full transition-all duration-500 ${(totalRecaudado / totalAlquiler) >= 1
                                    ? 'bg-green-500'
                                    : (totalRecaudado / totalAlquiler) >= 0.75
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                }`}
                            style={{ width: `${Math.min((totalRecaudado / totalAlquiler) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DataTable
