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


const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <div className="max-w-4xl mx-auto mt-4">
        <AddUserForm />
        <PaymentForm />
        <DataTable />
        <Summary />
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}

export default App;
