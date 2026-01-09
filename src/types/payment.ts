export interface User {
    _id: string;
    name: string;
    active?: boolean;
    saldoAnterior?: number; // Saldo que viene del año anterior
    createdAt?: string;
    updatedAt?: string;
}

export interface Payment {
    userId: string;
    _id: string;
    name: string;
    userName: string;
    mes: string;
    monto: number;
}

export interface AddUserResponse {
    message: string;
    user: User;
}

export interface AddPaymentResponse {
    message: string;
    payment: Payment;
}
