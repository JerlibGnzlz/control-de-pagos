import { useState } from 'react'
import { useUsers } from '../hooks/useUsers'
import { usePayments } from '../hooks/usePayments'
import { usePaymentCalculations } from '../hooks/usePaymentCalculations'
import { MESES } from './PaymentForm'
import type { User, Payment } from '../types/payment'
import Modal from './ui/Modal'
import EditPaymentModal from './EditPaymentModal'
import EditBalanceModal from './EditBalanceModal'

const DataTable = () => {
    const { users, updateUser, isUpdating: isUpdatingUser } = useUsers()
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

    // Estado del Modal de Edición de Saldo Anterior
    const [balanceEditConfig, setBalanceEditConfig] = useState<{
        isOpen: boolean;
        user: User | null;
    }>({
        isOpen: false,
        user: null
    });

    const {
        alquilerMes,
        handleAlquilerChange,
        resetAlquileres,
        getPagoPorMes,
        getTotalPorUsuario,
        getTotalPorMes,
        saldosAcumulados,
        totalRecaudado,
        totalAlquiler,
        totalSaldoAnterior
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
                resetAlquileres();
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

            {balanceEditConfig.user && (
                <EditBalanceModal
                    isOpen={balanceEditConfig.isOpen}
                    onClose={() => setBalanceEditConfig({ isOpen: false, user: null })}
                    onSave={async (amount) => {
                        if (balanceEditConfig.user) {
                            try {
                                await updateUser({
                                    id: balanceEditConfig.user._id,
                                    saldoAnterior: amount
                                });
                                setBalanceEditConfig({ isOpen: false, user: null });
                            } catch (error) {
                                alert('Error al actualizar el saldo anterior');
                            }
                        }
                    }}
                    initialAmount={balanceEditConfig.user.saldoAnterior || 0}
                    userName={balanceEditConfig.user.name}
                    isProcessing={isUpdatingUser}
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
                                    <div
                                        onClick={() => setBalanceEditConfig({ isOpen: true, user: u })}
                                        className="flex items-center gap-1 mt-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded transition-colors"
                                    >
                                        <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">Vienen:</span>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                            ${(u.saldoAnterior || 0).toLocaleString('es-AR')}
                                        </span>
                                        <span className="text-[10px] text-gray-400">✏️</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Monto total pagado</p>
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
                            <th className="border border-gray-300 dark:border-gray-600 p-2 text-left text-gray-900 dark:text-white font-bold w-32 bg-gray-100 dark:bg-gray-800">Usuario</th>
                            <th className="border border-gray-300 dark:border-gray-600 p-1 text-center font-bold text-blue-600 dark:text-blue-400 w-24 bg-gray-100 dark:bg-gray-800">Vienen</th>
                            {shortMonths.map(m => (
                                <th key={m} className="border border-gray-300 dark:border-gray-600 p-1 text-center font-semibold text-gray-700 dark:text-gray-300 w-auto bg-gray-100 dark:bg-gray-800">{m}</th>
                            ))}
                            <th className="border border-gray-400 dark:border-gray-500 p-2 text-right text-white dark:text-gray-200 font-bold w-24 bg-gray-600 dark:bg-gray-800 tracking-wider">TOTAL</th>
                        </tr>
                        {/* Recaudación Total Row (Saldo Inicial + Ingresos) */}
                        <tr className="bg-blue-50/50 dark:bg-blue-900/10 border-b-2 border-gray-400 dark:border-gray-500">
                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-left text-gray-800 dark:text-gray-200 font-extrabold text-xs uppercase tracking-wider bg-gray-100 dark:bg-gray-800">
                                🟢 SALDO INICIAL
                            </td>
                            {/* Celda Específica del Saldo Anterior (361.000) */}
                            <td className="border border-gray-300 dark:border-gray-600 px-1 py-1.5 text-right font-mono font-extrabold text-sm text-blue-800 dark:text-blue-300 bg-blue-100/50 dark:bg-blue-900/30">
                                {/* Fallback visual a 361.000 si la DB aún no refresca, por solicitud del usuario */}
                                ${(totalSaldoAnterior > 0 ? totalSaldoAnterior : 361000).toLocaleString('es-AR')}
                            </td>
                            {shortMonths.map((mes, idx) => {
                                const totalMes = getTotalPorMes(mes)
                                const alquiler = alquilerMes[idx]
                                const colorClass = totalMes >= alquiler
                                    ? 'text-gray-800 dark:text-gray-300 font-semibold'
                                    : 'text-red-500 dark:text-red-400'
                                return (
                                    <td key={mes} className={`border border-gray-300 dark:border-gray-600 px-1 py-1.5 text-right font-mono text-xs ${colorClass}`}>
                                        ${totalMes > 0 ? totalMes.toLocaleString('es-AR') : '-'}
                                    </td>
                                )
                            })}
                            <td className={`border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-right font-mono font-extrabold text-xs ${(totalRecaudado + (totalSaldoAnterior > 0 ? totalSaldoAnterior : 361000)) >= totalAlquiler ? 'text-blue-800 dark:text-blue-300' : 'text-red-600'} bg-gray-50 dark:bg-gray-800`}>
                                ${(totalRecaudado + (totalSaldoAnterior > 0 ? totalSaldoAnterior : 361000)).toLocaleString('es-AR')}
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u: User) => (
                            <tr key={u._id} className="even:bg-gray-50 dark:even:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                                <td className="border border-gray-300 dark:border-gray-600 px-2 py-1.5 font-medium text-left truncate text-gray-900 dark:text-white max-w-[120px]" title={u.name}>{u.name}</td>
                                <td
                                    onClick={() => setBalanceEditConfig({ isOpen: true, user: u })}
                                    className="border border-gray-300 dark:border-gray-600 px-1 py-1 text-right cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-mono font-bold text-blue-600 dark:text-blue-400 text-xs"
                                    title="Saldo del año anterior"
                                >
                                    ${(u.saldoAnterior || 0).toLocaleString('es-AR')}
                                </td>
                                {MESES.map((m) => {
                                    const pago = getPagoPorMes(u.name, m)
                                    return (
                                        <td
                                            key={m}
                                            onClick={() => handleCellClick(u, m)}
                                            className={`border border-gray-300 dark:border-gray-600 px-1 py-1 text-right font-mono text-xs transition-colors cursor-pointer hover:opacity-80 ${pago > 0
                                                ? 'bg-green-100/50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-semibold hover:bg-green-200 dark:hover:bg-green-900/40'
                                                : 'text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                            title={pago > 0 ? "Click para editar" : ""}
                                        >
                                            {pago ? `$${pago.toLocaleString('es-AR')}` : '-'}
                                        </td>
                                    )
                                })}
                                <td className="border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/10 dark:bg-indigo-900/10">
                                    ${(getTotalPorUsuario(u.name) + (u.saldoAnterior || 0)).toLocaleString('es-AR')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-700/50 font-semibold text-xs">
                        {/* 1. CALCULO SALDO (IDEM Anterior: Saldo Inicial + Ingresos mensuales acumulados) */}
                        <tr className="bg-blue-100 dark:bg-blue-900/40 border-t-2 border-blue-300 dark:border-blue-700">
                            <td className="border-r border-gray-300 dark:border-gray-600 px-2 py-3 text-left">
                                <span className="text-gray-900 dark:text-white font-extrabold text-sm uppercase">CALCULO SALDO</span>
                            </td>
                            <td className="border-t border-gray-300 dark:border-gray-600 px-1 py-1.5 text-right font-mono font-extrabold text-sm text-blue-800 dark:text-blue-300 bg-blue-100/50 dark:bg-blue-900/30">
                                ${(totalSaldoAnterior > 0 ? totalSaldoAnterior : 361000).toLocaleString('es-AR')}
                            </td>
                            {MESES.map((m, idx) => {
                                // Calculate running balance up to this month
                                let accumulatedIncome = 0;
                                for (let i = 0; i <= idx; i++) {
                                    accumulatedIncome += getTotalPorMes(MESES[i]);
                                }
                                const currentRunningBalance = (totalSaldoAnterior > 0 ? totalSaldoAnterior : 361000) + accumulatedIncome;

                                return (
                                    <td key={m} className="border border-gray-300 dark:border-gray-600 p-1 text-right font-mono font-bold text-blue-700 dark:text-blue-300 text-xs bg-blue-50/50 dark:bg-blue-900/20">
                                        ${currentRunningBalance.toLocaleString('es-AR')}
                                    </td>
                                )
                            })}
                            <td className="border-l border-gray-300 dark:border-gray-600 px-2 py-3 text-right">
                                <span className="text-gray-900 dark:text-white font-extrabold text-sm">
                                    ${((totalSaldoAnterior > 0 ? totalSaldoAnterior : 361000) + totalRecaudado).toLocaleString('es-AR')}
                                </span>
                            </td>
                        </tr>

                        {/* 2. GASTOS POR MES (Editable) */}
                        <tr className="bg-yellow-50 dark:bg-yellow-900/20 border-t border-gray-300 dark:border-gray-600">
                            <td className="border-r border-gray-300 dark:border-gray-600 px-2 py-2 text-left">
                                <div className="flex flex-col">
                                    <span className="text-red-700 dark:text-red-400 font-bold uppercase text-xs">🔻 GASTOS POR MES</span>
                                    <span className="text-[10px] text-gray-500">(Clic para editar)</span>
                                </div>
                            </td>
                            <td className="border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
                                {/* Spacer for Saldo Inicial column - No expenses possible here */}
                            </td>
                            {MESES.map((m) => (
                                <td key={m} className="border border-gray-300 dark:border-gray-600 p-1 text-center">
                                    <input
                                        type="number"
                                        min="0"
                                        step="1000"
                                        placeholder="0"
                                        className="w-full text-right bg-transparent border-b border-dashed border-red-300 focus:border-red-500 focus:outline-none text-red-700 dark:text-red-400 font-mono text-xs hover:bg-white/50 dark:hover:bg-black/20 rounded-sm"
                                        value={alquilerMes[MESES.indexOf(m)] || ''}
                                        onChange={e => handleAlquilerChange(MESES.indexOf(m), Number(e.target.value))}
                                    />
                                </td>
                            ))}
                            <td className="border-l border-gray-300 dark:border-gray-600 px-2 py-2 text-right">
                                <span className="text-red-700 dark:text-red-400 font-bold font-mono text-xs">
                                    ${totalAlquiler.toLocaleString('es-AR')}
                                </span>
                            </td>
                        </tr>

                        {/* 3. SALDO DISPONIBLE (Calculo Saldo - Gastos Acumulados) */}
                        <tr className="bg-green-100 dark:bg-green-900/40 border-t-2 border-green-300 dark:border-green-700">
                            <td className="border-r border-gray-300 dark:border-gray-600 px-2 py-3 text-left">
                                <span className="text-green-900 dark:text-green-100 font-extrabold text-sm uppercase">✅ SALDO DISPONIBLE</span>
                            </td>
                            <td className="border-t border-gray-300 dark:border-gray-600 px-1 py-1.5 text-right font-mono font-extrabold text-sm text-green-800 dark:text-green-300 bg-green-100/50 dark:bg-green-900/30">
                                ${(totalSaldoAnterior > 0 ? totalSaldoAnterior : 361000).toLocaleString('es-AR')}
                            </td>
                            {MESES.map((m, idx) => {
                                // 1. Running Income (same as Calculo Saldo)
                                let accumulatedIncome = 0;
                                for (let i = 0; i <= idx; i++) {
                                    accumulatedIncome += getTotalPorMes(MESES[i]);
                                }
                                const currentIncomeBalance = (totalSaldoAnterior > 0 ? totalSaldoAnterior : 361000) + accumulatedIncome;

                                // 2. Running Expenses (Gastos Acumulados hasta el mes)
                                let accumulatedExpenses = 0;
                                for (let i = 0; i <= idx; i++) {
                                    accumulatedExpenses += (alquilerMes[i] || 0);
                                }

                                // 3. Available Balance = Income Balance - Accumulated Expenses
                                const availableBalance = currentIncomeBalance - accumulatedExpenses;

                                return (
                                    <td key={m} className={`border border-gray-300 dark:border-gray-600 p-1 text-right font-mono font-extrabold text-xs ${availableBalance >= 0 ? 'text-green-800 dark:text-green-300' : 'text-red-600'}`}>
                                        ${availableBalance.toLocaleString('es-AR')}
                                    </td>
                                )
                            })}
                            <td className="border-l border-gray-300 dark:border-gray-600 px-2 py-3 text-right">
                                <span className={`font-extrabold text-sm ${((totalSaldoAnterior > 0 ? totalSaldoAnterior : 361000) + totalRecaudado - totalAlquiler) >= 0 ? 'text-green-900 dark:text-green-100' : 'text-red-600'}`}>
                                    ${((totalSaldoAnterior > 0 ? totalSaldoAnterior : 361000) + totalRecaudado - totalAlquiler).toLocaleString('es-AR')}
                                </span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>


        </div >
    )
}

export default DataTable
