import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';
import { STATUS } from '../constants/messages';

export const validate = (schema: ZodType<any>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsedData = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            req.body = parsedData.body;
            Object.defineProperty(req, 'query', { value: parsedData.query, writable: true, configurable: true });
            Object.defineProperty(req, 'params', { value: parsedData.params, writable: true, configurable: true });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    status: STATUS.FAIL,
                    message: 'Validation failed',
                    errors: error.issues.map((err: any) => ({
                        path: err.path.join('.'),
                        message: err.message,
                    })),
                });
                return;
            }
            next(error);
        }
    };
};
