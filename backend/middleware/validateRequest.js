import { z } from 'zod';

export const validateRequest = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors.map((issue) => ({
                message: `${issue.path.join('.')} is ${issue.message}`,
            }));
            const err = new Error('Error de validación');
            err.statusCode = 400;
            err.message = 'Datos inválidos';
            err.details = errorMessages;
            next(err);
        } else {
            next(error);
        }
    }
};
