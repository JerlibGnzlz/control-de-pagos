// src/App.tsx
import AddUserForm from './components/AddUserForm';
import PaymentForm from './components/PaymentForm';
import DataTable from './components/DataTable';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient } from './queryClient';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import Summary from './components/Summary';
import './index.css'
import ExportToPDF from './components/ExportToPDF';

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <div className="max-w-4xl mx-auto mt-4 p-4">
        {/* Encabezado de la app */}
        <h1 className="text-3xl font-bold text-center mb-6 text-indigo-600">
          Sistema de Pago de Alquiler
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Registra y  gestiona pagos de alquiler y genera reportes fácilmente.
        </p>

        {/* Componentes */}
        <AddUserForm />
        <PaymentForm />
        <DataTable />
        <Summary />
        <ExportToPDF />
      </div>

      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}

export default App;
