import express, { RequestHandler } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import mongoSanitize from 'express-mongo-sanitize'
import path from 'path'
import { fileURLToPath } from 'url'
import rateLimit from 'express-rate-limit'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function configureServer(app: express.Application) {
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: false,
        keyGenerator: (req) => req.ip || 'unknown',
        handler: (req, res) => {
            res.status(429).json({
                error: 'Too many requests, please try again later.'
            })
        }
    })

    // CORS configuration
    app.use(cors({
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'sentry-trace',
            'baggage',
            'Accept',
            'Origin',
            'Access-Control-Request-Method',
            'Access-Control-Request-Headers'
        ],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
        maxAge: 600 // 10 minutes
    }))

    // Security headers
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "http://localhost:5173", "http://127.0.0.1:5173"],
                styleSrc: ["'self'", "'unsafe-inline'", "http://localhost:5173", "http://127.0.0.1:5173"],
                imgSrc: ["'self'", "data:", "https:", "http://localhost:5173", "http://127.0.0.1:5173"],
                connectSrc: ["'self'", "wss:", "ws:", "http://localhost:5173", "http://127.0.0.1:5173"],
            },
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" },
        dnsPrefetchControl: true,
        frameguard: { action: 'deny' },
        hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
        ieNoOpen: true,
        noSniff: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        xssFilter: true
    }))

    // Middleware configuration
    app.use(cookieParser() as RequestHandler)
    app.use(limiter as RequestHandler)
    app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }) as RequestHandler)
    app.use(bodyParser.json({ limit: '50mb' }) as RequestHandler)
    app.use(express.json() as RequestHandler)
    app.use(mongoSanitize() as RequestHandler)
    app.use(morgan('combined') as RequestHandler)

    // Add OPTIONS handling for preflight requests
    app.options('*', cors())

    // Static files with security headers
    app.use('/assets/uploads', express.static(path.join(__dirname, '../../assets/uploads'), {
        setHeaders: (res, path) => {
            res.set('X-Content-Type-Options', 'nosniff')
            res.set('X-Frame-Options', 'DENY')
        }
    }))

    // Only serve static files in production
    if (process.env.NODE_ENV === 'production') {
        const buildPath = path.join(__dirname, '../../build')
        app.use(express.static(buildPath))

        // Serve index.html for all other routes in production
        app.get('*', (req, res) => {
            res.sendFile(path.join(buildPath, 'index.html'))
        })
    }

    return app
}