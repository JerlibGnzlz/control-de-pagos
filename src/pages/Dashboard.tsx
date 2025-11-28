import AddUserForm from '../components/AddUserForm';
import PaymentForm from '../components/PaymentForm';
import DataTable from '../components/DataTable';
import Summary from '../components/Summary';
import ExportToPDF from '../components/ExportToPDF';

const Dashboard = () => {
    return (
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
    );
};

export default Dashboard;
