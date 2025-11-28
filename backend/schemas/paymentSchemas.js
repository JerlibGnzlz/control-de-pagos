import { z } from 'zod';

const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const createPaymentSchema = z.object({
    userId: z.string().optional(),
    name: z.string().min(1, 'El nombre es requerido').optional(),
    mes: z.enum(MESES, {
        errorMap: () => ({ message: 'Mes inválido' })
    }),
    monto: z.number().positive('El monto debe ser positivo')
}).refine(data => data.userId || data.name, {
    message: "Debe proporcionar userId o name",
    path: ["userId", "name"]
});
