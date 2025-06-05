/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// import dependencies
import os from 'os'
import jwt from 'jsonwebtoken'
import Data from './models/issue.js'
import Project from './models/project.js'
import userRoutes from './routes/user.js'
import authRoutes from './routes/auth.js'
import issueRoutes from './routes/issue.js'
import projectRoutes from './routes/project.js'
import config from '../config/index.js'
import express from 'express'
import mongoSanitize from 'express-mongo-sanitize'
import bodyParser from 'body-parser'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import mongoose from 'mongoose'
import User from './models/User.js'
import Comments from './models/comment.js'
import path from 'path'
import logger from 'morgan'
import moment from 'moment-timezone'
import multer from 'multer'
import multipart from 'connect-multiparty'
import cookieParser from 'cookie-parser'
import AccessControl from 'accesscontrol'
import rateLimit from 'express-rate-limit'
import cluster from 'cluster'
import process from 'process'
import crypto from 'crypto'
import { Server } from 'socket.io'
import { createServer } from 'http'
import AccountController from './accounts/account.controller.js'
import accountService from './controllers/user'
import { configureServer } from './config/server'
import { configureSocketServer } from './config/socket'
import { connectDatabase } from './config/database'
import { errorHandler } from './middleware/errorHandler'
import routes from './routes/index'

const totalCPUs = os.cpus().length
const uniqueID = crypto.randomBytes(16).toString('hex')

// MongoDB database
const API_PORT = 3001
const SOCKET_PORT = 4000
const URI = config.mongoURI

// define the Express app
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        transports: ['websocket', 'polling'],
        credentials: true,
        forceNew: false,
        secure: true,
    },
    allowEIO3: true,
})

if (cluster.isPrimary) {
    console.log(`Number of CPUs is ${totalCPUs}`)
    console.log(`Master ${process.pid} is running`)

    // Fork workers.
    for (let i = 0; i < totalCPUs; i++) {
        cluster.fork()
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`)
        console.log("Let's fork another worker!")
        cluster.fork()
    })

    // Start the httpServer for socket connections only in the primary process
    httpServer.listen(SOCKET_PORT, '0.0.0.0', () => {
        console.log(`Socket server started on port ${SOCKET_PORT}`)
    })

    io.on('connection', (socket) => {
        console.log(`⚡: ${socket.id} user just connected!`)

        socket.on('msg', function (msg) {
            console.log('entered!')
            console.log('message: ' + msg)
        })

        socket.on('user_connect', async (userId) => {
            try {
                const user = await User.findById(userId)
                if (user) {
                    user.socketId = socket.id
                    await user.save()
                }
            } catch (err) {
                console.error('Error finding or saving user:', err)
            }
        })

        socket.on('new_issue', async (issue, userId) => {
            try {
                const user = await User.findById(userId)
                if (user && user.socketId) {
                    io.to(user.socketId).emit('new_issue', issue, userId)
                }
            } catch (err) {
                console.error('Error finding user for new_issue:', err)
            }
        })

        socket.on('disconnect', () => {
            console.log(`⚡: ${socket.id} user just disconnected!`)
            socket.disconnect()
        })
    })
} else {
    console.log(`Worker ${process.pid} started`)

    process.on('unhandledRejection', (rejectionErr) => {
        console.log('unhandledRejection Err::', rejectionErr)
        console.log('unhandledRejection Stack::', JSON.stringify(rejectionErr.stack))
    })

    process.on('uncaughtException', (uncaughtExc) => {
        console.log('uncaughtException Err::', uncaughtExc)
        console.log('uncaughtException Stack::', JSON.stringify(uncaughtExc.stack))
    })

    process.env.UV_THREADPOOL_SIZE = os.cpus().length
    console.log('Threadpool size set to: ', os.cpus().length)

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    })

    const grants = {
        Admin: {
            issues: {
                'create:any': ['*'],
                'read:any': ['*'],
                'update:any': ['*'],
                'delete:any': ['*'],
            },
            editusers: {
                'create:any': ['*'],
                'read:any': ['*'],
                'update:any': ['*'],
                'delete:any': ['*'],
            },
        },
        Bruker: {
            issues: {
                'create:own': ['*', '!views'],
                'read:own': ['*'],
                'update:own': ['*', '!views'],
                'delete:own': ['*'],
            },
            editusers: {
                'create:own': ['*', '!email', '!rights'],
                'read:own': ['*'],
                'update:own': ['*', '!role', '!email', '!rights'],
                'delete:own': ['*', '!email', '!rights'],
            },
        },
    }

    const ac = new AccessControl(grants)
    var multipartMiddleware = multipart()

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, '../assets/uploads')
        },
        filename: function (req, file, cb) {
            cb(null, uniqueID + '-' + file.originalname)
        },
    })

    const fileFilter = (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true)
        } else {
            cb(null, false)
        }
    }

    var upload = multer({
        storage: storage,
        limits: {
            fileSize: 1024 * 1024 * 20, // Set max size for upload ; Current is 20 Mb
        },
        fileFilter: fileFilter,
    })

    mongoose.set('strictQuery', true) // or false, depending on your needs

    // Function to connect to MongoDB
    const connectWithRetry = async () => {
        await mongoose
            .connect(URI, {
                maxPoolSize: 50,
                serverSelectionTimeoutMS: 60000,
                socketTimeoutMS: 60000,
                connectTimeoutMS: 60000,
            })
            .catch((err) => {
                console.log('MongoDB connection error:', err)
                setTimeout(connectWithRetry, 5000) // Retry after 5 seconds
            })
    }

    mongoose.set('debug', true)

    // Connect to MongoDB
    connectWithRetry()

    const db = mongoose.connection

    db.once('open', function () {
        console.log('connected to the database')
    })

    mongoose.connection.on('error', (err) => {
        console.error('Mongoose connection error:', err)
    })

    mongoose.connection.on('connected', () => {
        console.log('Mongoose connected to db')
    })

    mongoose.connection.on('disconnected', () => {
        console.log('Mongoose disconnected')
    })

    const ProtectedRoutes = express.Router()

    app.set('view engine', 'ejs')

    app.use(cookieParser())
    app.set('jwtSecret', config.jwtSecret)
    app.use(
        limiter,
        bodyParser.urlencoded({
            extended: true,
            limit: '50mb',
        })
    )
    app.use(logger('dev'))
    app.use(bodyParser.json({ limit: '50mb' }))
    app.use('/uploads', express.static('../assets/uploads'))
    let __dirname = path.resolve()
    app.use(express.static(path.join(__dirname, '../build')))

    // Mount routes in specific order
    console.log('Mounting routes...')

    // Add request logging middleware for all requests
    app.use((req, res, next) => {
        console.log('\n=== Incoming Request ===')
        console.log(`Time: ${new Date().toISOString()}`)
        console.log(`Method: ${req.method}`)
        console.log(`URL: ${req.url}`)
        console.log('Headers:', JSON.stringify(req.headers, null, 2))
        console.log('Cookies:', JSON.stringify(req.cookies, null, 2))
        console.log('Body:', JSON.stringify(req.body, null, 2))
        console.log('=====================\n')
        next()
    })

    console.log('Mounting auth routes...')
    app.use('/api', authRoutes)  // Auth routes first (login, register, etc.)

    // Add authentication middleware to ProtectedRoutes
    ProtectedRoutes.use((req, res, next) => {
        console.log('\n=== Protected Route Access ===')
        console.log(`Time: ${new Date().toISOString()}`)
        console.log(`Method: ${req.method}`)
        console.log(`URL: ${req.url}`)
        console.log('Headers:', JSON.stringify(req.headers, null, 2))
        console.log('Cookies:', JSON.stringify(req.cookies, null, 2))

        const token = req.headers.authorization
        if (!token) {
            console.log('No token provided')
            return res.status(401).json({ error: 'No token provided' })
        }

        try {
            // Remove 'Bearer ' prefix if present
            const tokenWithoutBearer = token.startsWith('Bearer ') ? token.slice(7) : token
            console.log('Token without Bearer:', tokenWithoutBearer)

            const decoded = jwt.verify(tokenWithoutBearer, config.jwtSecret)
            req.user = decoded
            console.log('Token verified, user:', decoded)
            next()
        } catch (err) {
            console.error('Token verification failed:', err)
            console.error('Error details:', {
                name: err.name,
                message: err.message,
                stack: err.stack
            })
            return res.status(401).json({
                error: 'Invalid token',
                details: err.message
            })
        }
    })

    // Mount all protected routes under ProtectedRoutes
    console.log('Mounting protected routes...')
    app.use('/api', ProtectedRoutes)

    // Mount user routes under ProtectedRoutes
    console.log('Mounting user routes...')
    ProtectedRoutes.use('/users', userRoutes)

    // Mount other protected routes
    console.log('Mounting account routes...')
    ProtectedRoutes.use('/accounts', AccountController)
    console.log('Mounting issue routes...')
    ProtectedRoutes.use('/issues', issueRoutes)
    console.log('Mounting project routes...')
    ProtectedRoutes.use('/projects', projectRoutes)

    app.get('/', function (req, res, next) {
        res.sendFile(path.resolve('../build/index.html'))
    })
    app.use(helmet())
    app.use(express.json())
    app.use(mongoSanitize())
    app.use(express.urlencoded({ extended: true }))
    app.use(cors())
    app.use(express.static(__dirname + '/public/'))
    app.use(morgan('combined'))

    // Add route debugging middleware
    app.use((req, res, next) => {
        console.log('\n=== Route Debug ===')
        console.log(`Time: ${new Date().toISOString()}`)
        console.log(`Method: ${req.method}`)
        console.log(`URL: ${req.url}`)
        console.log('Registered Routes:')
        console.log('- Auth Routes:', authRoutes.stack.map(r => r.route?.path).filter(Boolean))
        console.log('- User Routes:', userRoutes.stack.map(r => r.route?.path).filter(Boolean))
        console.log('- Protected Routes:', ProtectedRoutes.stack.map(r => r.route?.path).filter(Boolean))
        console.log('=====================\n')
        next()
    })

    // Error handling middleware
    app.use((err, req, res, next) => {
        if (err.name === 'UnauthorizedError') {
            res.status(401).json({ error: err.name + ':' + err.message })
        }
    })

    app.listen(API_PORT, () => {
        console.log(
            `Started server on =>`,
            '\x1b[33m',
            `http://localhost:${API_PORT}`,
            '\x1b[0m',
            `for Process ID =>`,
            '\x1b[44m',
            `${process.pid}`,
            '\x1b[0m'
        )
    })
}
