import { useState, useMemo } from 'react';
import { useUsers } from '../hooks/useUsers';
import type { User } from '../types/payment';
import Modal from './ui/Modal';

export default function UserManagement() {
    const [showInactive, setShowInactive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editName, setEditName] = useState('');
    const [error, setError] = useState('');

    // Estado del Modal
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

    const {
        users,
        isLoading,
        updateUser,
        isUpdating,
        deleteUser,
        isDeleting,
        reactivateUser,
        isReactivating
    } = useUsers(showInactive);

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setEditName(user.name);
        setError('');
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setEditName('');
        setError('');
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;

        if (!editName.trim()) {
            setError('El nombre no puede estar vacío');
            return;
        }

        try {
            await updateUser({ id: editingUser._id, name: editName.trim() });
            setEditingUser(null);
            setEditName('');
            setError('');
        } catch (err: any) {
            setError(err.message || 'Error al actualizar usuario');
        }
    };

    const handleDeleteClick = (user: User) => {
        setModalConfig({
            isOpen: true,
            title: 'Desactivar Usuario',
            message: `¿Estás seguro que deseas desactivar al usuario "${user.name}"? Podrás reactivarlo más tarde.`,
            type: 'danger',
            onConfirm: async () => {
                try {
                    await deleteUser(user._id);
                    setModalConfig(prev => ({ ...prev, isOpen: false })); // Close modal on success
                } catch (err: any) {
                    setError(err.message || 'Error al desactivar usuario');
                    setModalConfig(prev => ({ ...prev, isOpen: false })); // Close modal even on error
                }
            }
        });
    };

    const handleReactivateClick = (user: User) => {
        setModalConfig({
            isOpen: true,
            title: 'Reactivar Usuario',
            message: `¿Deseas reactivar la cuenta de "${user.name}"?`,
            type: 'info',
            onConfirm: async () => {
                try {
                    await reactivateUser(user._id);
                    setModalConfig(prev => ({ ...prev, isOpen: false })); // Close modal on success
                } catch (err: any) {
                    setError(err.message || 'Error al reactivar usuario');
                    setModalConfig(prev => ({ ...prev, isOpen: false })); // Close modal even on error
                }
            }
        });
    };

    // Filtrar usuarios basado en búsqueda y estado
    const filteredUsers = useMemo(() => {
        return users.filter(u =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const activeUsers = filteredUsers.filter(u => u.active !== false);
    const inactiveUsers = filteredUsers.filter(u => u.active === false);

    if (isLoading) {
        return <div className="text-center py-8 text-gray-600 dark:text-gray-300 animate-pulse">Cargando usuarios...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto mt-8 mb-12">
            <Modal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
            />

            {/* Header del Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            👥 Gestión de Usuarios
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Administra el acceso y estado de los miembros
                        </p>
                    </div>

                    <button
                        onClick={() => setShowInactive(!showInactive)}
                        className={`px-4 py-2 rounded-lg transition-all transform active:scale-95 text-sm font-semibold flex items-center gap-2 ${showInactive
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        {showInactive ? '👁️ Ocultar inactivos' : '👁️‍🗨️ Mostrar inactivos'}
                    </button>
                </div>

                {/* Barra de Búsqueda Inteligente */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400 text-lg">🔍</span>
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar usuario por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    />
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-800 flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}
            </div>

            {/* Grid de Usuarios Activos */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Usuarios Activos ({activeUsers.length})
                    </h3>
                </div>

                {activeUsers.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">
                            {searchTerm ? 'No se encontraron usuarios activos con ese nombre' : 'No hay usuarios activos registrados'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeUsers.map(user => (
                            <div
                                key={user._id}
                                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 ${editingUser?._id === user._id ? 'ring-2 ring-indigo-500 border-transparent' : ''
                                    }`}
                            >
                                {editingUser?._id === user._id ? (
                                    // Modo Tarjeta de Edición
                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">EDITANDO</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full px-3 py-2 border border-indigo-300 dark:border-indigo-600 rounded bg-indigo-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none"
                                            autoFocus
                                            placeholder="Nuevo nombre..."
                                        />
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={handleSaveEdit}
                                                disabled={isUpdating}
                                                className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium transition-colors"
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                disabled={isUpdating}
                                                className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // Modo Tarjeta Normal
                                    <>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white capitalize leading-tight">
                                                        {user.name}
                                                    </h4>
                                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded mt-1 inline-block">
                                                        Miembro
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="flex-1 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded transition-colors flex items-center justify-center gap-1"
                                            >
                                                <span>✏️</span> Editar
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(user)}
                                                disabled={isDeleting}
                                                className="flex-1 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors flex items-center justify-center gap-1"
                                            >
                                                <span>🗑️</span> Desactivar
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Grid de Usuarios Inactivos */}
            {showInactive && inactiveUsers.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                            Usuarios Inactivos ({inactiveUsers.length})
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {inactiveUsers.map(user => (
                            <div
                                key={user._id}
                                className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4 opacity-75 hover:opacity-100 transition-opacity"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-bold text-lg">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-600 dark:text-gray-300 capitalize line-through decoration-red-500 decoration-2">
                                                {user.name}
                                            </p>
                                            <span className="text-[10px] text-red-500 font-medium">Inactivo</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleReactivateClick(user)}
                                    disabled={isReactivating}
                                    className="w-full py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 rounded-lg text-sm font-medium transition-all shadow-sm"
                                >
                                    🔄 Reactivar Cuenta
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
