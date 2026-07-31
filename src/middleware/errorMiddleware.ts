import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Custom Error Class
export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('ERROR CAUGHT IN MIDDLEWARE:', err);
    if (logger && logger.error) {
        logger.error(err.message || String(err));
    }

    const statusCode = err.statusCode || 500;
    const errMessage = err.message || '';

    // Detect internal database, driver, or system execution errors
    const isInternalDbOrSystemError =
        err.name === 'MongoServerSelectionError' ||
        err.name === 'MongoNetworkError' ||
        err.name === 'MongooseError' ||
        errMessage.includes('buffering timed out') ||
        errMessage.includes('ECONNREFUSED') ||
        errMessage.includes('ETIMEDOUT') ||
        (statusCode === 500 && !(err instanceof AppError));

    if (isInternalDbOrSystemError) {
        return res.status(500).json({
            status: 'fail',
            message: 'Internal Server Error. Please try again later.',
        });
    }

    return res.status(statusCode).json({
        status: 'fail',
        message: errMessage || 'An unexpected error occurred.',
    });
};
