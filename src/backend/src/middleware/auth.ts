import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import config from '../config/index.js'

interface JWTPayload {
    userId: string
    role?: string
    iat: number
    exp: number
}

declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload
        }
    }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
    let token: string | undefined

    // Handle both "Bearer <token>" and direct token formats
    if (req.headers.authorization) {
        if (req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1]
        } else {
            // Direct token without "Bearer " prefix
            token = req.headers.authorization
        }
    }

    if (!token && req.cookies.token) {
        token = req.cookies.token
    }

    if (!token) {
        return res.status(401).json({
            error: 'Authentication required',
            message: 'No token provided.'
        })
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload

        // Token is valid - no need to check type since we only generate one type

        // Check token expiration
        if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
            return res.status(401).json({
                error: 'Token expired',
                message: 'Token has expired.'
            })
        }

        req.user = decoded
        next()
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                error: 'Token expired',
                message: 'Token has expired.'
            })
        }
        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                error: 'Invalid token',
                message: 'Token is invalid.'
            })
        }
        return res.status(500).json({
            error: 'Authentication error',
            message: 'An error occurred during authentication.'
        })
    }
}