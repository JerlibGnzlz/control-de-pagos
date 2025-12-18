import { useState, useEffect } from 'react';

interface EditPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (monto: number) => Promise<void>;
    onDelete: () => Promise<void>;
    initialAmount: number;
    userName: string;
    month: string;
    isProcessing: boolean;
}

export default function EditPaymentModal({
    isOpen,
    onClose,
    onSave,
    onDelete,
    initialAmount,
    userName,
    month,
    isProcessing
}: EditPaymentModalProps) {
    const [amount, setAmount] = useState(initialAmount);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAmount(initialAmount);
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, initialAmount]);

    if (!isVisible && !isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm transform transition-all duration-300 scale-100 overflow-hidden ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 scale-95'
                    }`}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                    <h3 className="text-white font-bold text-lg">Editar Pago</h3>
                    <p className="text-blue-100 text-sm">{userName} - {month}</p>
                </div>

                <div className="p-6">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Monto del pago ($)
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full text-3xl font-bold text-center text-gray-900 dark:text-white border-b-2 border-indigo-200 focus:border-indigo-600 dark:bg-transparent outline-none py-2 transition-colors"
                            autoFocus
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => onSave(amount)}
                            disabled={isProcessing}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {isProcessing ? 'Guardando...' : '💾 Guardar Cambios'}
                        </button>

                        <div className="flex gap-3">
                            <button
                                onClick={onDelete}
                                disabled={isProcessing}
                                className="flex-1 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-red-200"
                            >
                                {isProcessing ? '...' : '🗑️ Eliminar'}
                            </button>
                            <button
                                onClick={onClose}
                                disabled={isProcessing}
                                className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
