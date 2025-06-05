import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/AppError'

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        })
    }

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'fail',
            message: Object.values(err.errors).map(error => error.message)
        })
    }

    // Handle Mongoose duplicate key errors
    if (err.name === 'MongoError' && (err as any).code === 11000) {
        return res.status(400).json({
            status: 'fail',
            message: 'Duplicate field value entered'
        })
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'fail',
            message: 'Invalid token. Please log in again!'
        })
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            status: 'fail',
            message: 'Your token has expired! Please log in again.'
        })
    }

    // Handle other errors
    console.error('Error:', err)
    return res.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
}