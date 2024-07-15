/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// import dependencies
import os from 'os'
import jwt from 'jsonwebtoken'
import Data from './models/issue.js'
import userRoutes from './routes/user.js'
import authRoutes from './routes/auth.js'
import issueRoutes from './routes/issue.js'
import projectRoutes from './routes/project.js'
//import validateCommentInput from '../../validation/comment-validation.js'
import config from '../config/index.js'
import express from 'express'
import mongoSanitize from 'express-mongo-sanitize'
import bodyParser from 'body-parser'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import mongoose from 'mongoose'
import User from './models/user.js'
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
            console.log('entered!') // <--- It will print now !
            console.log('message: ' + msg)
        })

        socket.on('user_connect', async (userId) => {
            const user = await User.findById(userId)
            if (user) {
                user.socketId = socket.id
                await user.save()
            }
        })

        socket.on('new_issue', (issue, userId) => {
            User.findById(userId).then((user) => {
                if (user && user.socketId) {
                    io.to(user.socketId).emit('new_issue', issue, userId)
                }
            })
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

    try {
        await mongoose.connect(URI, {
            serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
            socketTimeoutMS: 45000, // Set socket timeout to 45 seconds
        })
    } catch (error) {
        console.log('MongoDB connection error:', error)
    }

    const db = mongoose.connection

    db.once('open', function () {
        console.log('connected to the database')
    })

    db.on('error', console.error.bind(console, 'MongoDB connection error:'))
    mongoose.Promise = global.Promise

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

    app.use('/', authRoutes)
    app.use('/accounts', AccountController)
    app.use('/', userRoutes)
    app.use('/', issueRoutes)
    app.use('/', projectRoutes)

    app.use((err, req, res, next) => {
        if (err.name === 'UnauthorizedError') {
            res.status(401).json({ error: err.name + ':' + err.message })
        }
    })

    ProtectedRoutes.use((req, res, next) => {
        var token = req.headers.authorization
        if (token === undefined) {
            token = req.body.token
        }
        if (token === undefined) {
            token = req.body.headers.Authorization
        }
        if (token) {
            try {
                jwt.verify(token, app.get('jwtSecret'), (err, decoded) => {
                    if (err) {
                        return res.json({ message: 'invalid token' })
                    } else {
                        req.decoded = decoded
                        next()
                    }
                })
            } catch (err) {
                console.log('An error occurred: ', err)
            }
        } else {
            res.send({ message: 'No token provided.' })
        }
    })

    ProtectedRoutes.route('/uploadimage', multipartMiddleware).post(
        upload.array('imageData', 12),
        function (req, res, next) {
            const file = req.files
            if (!file) {
                const error = new Error('En feil oppstod')
                error.httpStatusCode = 400
                return next(error)
            }
            res.send(file)
        }
    )

    ProtectedRoutes.route('/countIssues').get(async function (req, res, next) {
        Data.countDocuments({}, function (err, result) {
            if (err) {
                res.send(err)
            } else {
                res.json(result)
            }
        })
    })

    ProtectedRoutes.route('/getLatestCases').get(async function (req, res, next) {
        Data.find({})
            .select(['createdAt', 'summary', 'priority', 'severity'])
            .sort({ createdAt: -1 })
            .limit(5)
            .exec(function (err, result) {
                if (err) {
                    console.log(err)
                    res.send(err)
                } else {
                    res.json(result)
                }
            })
    })

    ProtectedRoutes.route('/getTodaysIssues').get(async function (req, res, next) {
        var yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)

        Data.countDocuments({ createdAt: { $gte: yesterday } }, function (err, result) {
            if (err) {
                res.send(err)
            } else {
                res.json(result)
            }
        })
    })

    ProtectedRoutes.route('/countSolvedIssues').get(async function (req, res, next) {
        Data.countDocuments({ status: 'Løst' }, function (err, result) {
            if (err) {
                res.send(err)
            } else {
                res.json(result)
            }
        })
    })

    ProtectedRoutes.route('/thisWeekIssuesCount').get(async function (req, res, next) {
        const oneDay = 1000 * 60 * 60 * 24,
            oneWeek = oneDay * 7

        let d = Date.now()
        let lastDay = d - (d % oneDay) + oneDay
        let firstDay = lastDay - oneWeek

        var start = moment().startOf('week').format()
        var end = moment().endOf('week').format()

        Data.aggregate(
            [
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(start),
                            $lte: new Date(end),
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            day: { $dayOfMonth: '$createdAt' },
                            month: { $month: '$createdAt' },
                            year: { $year: '$createdAt' },
                        },
                        count: { $sum: 1 },
                    },
                },
            ],
            function (err, result) {
                if (err) {
                    res.send(err)
                } else {
                    res.json(result)
                }
            }
        )
    })

    ProtectedRoutes.route('/thisYearIssuesCount').get(async function (req, res) {
        const oneDay = 1000 * 60 * 60 * 24,
            oneWeek = oneDay * 7

        let d = Date.now()
        let lastDay = d - (d % oneDay) + oneDay
        let firstDay = lastDay - oneWeek

        const FIRST_MONTH = 1
        const LAST_MONTH = 12
        const monthsArray = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ]

        var start = moment().startOf('year').format()
        var end = moment().endOf('year').format()

        Data.aggregate(
            [
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(start),
                            $lte: new Date(end),
                        },
                    },
                },
                {
                    $group: {
                        _id: { year_month: { $substrCP: ['$createdAt', 0, 24] } },
                    },
                },
                {
                    $sort: { '_id.year_month': -1 },
                },
                {
                    $project: {
                        _id: 0,
                        count: { $sum: 1 },
                        month_year: {
                            $concat: [
                                {
                                    $arrayElemAt: [
                                        monthsArray,
                                        {
                                            $subtract: [{ $toInt: { $substrCP: ['$_id.year_month', 5, 2] } }, 1],
                                        },
                                    ],
                                },
                                '-',
                                { $substrCP: ['$_id.year_month', 0, 4] },
                            ],
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        data: { $push: { k: '$month_year', v: '$count' } },
                    },
                },
                {
                    $addFields: {
                        start_year: { $substrCP: [start, 0, 4] },
                        end_year: { $substrCP: [end, 0, 4] },
                        months1: {
                            $range: [{ $toInt: { $substrCP: [start, 5, 2] } }, { $add: [LAST_MONTH, 1] }],
                        },
                        months2: {
                            $range: [FIRST_MONTH, { $add: [{ $toInt: { $substrCP: [end, 5, 2] } }, 1] }],
                        },
                    },
                },
                {
                    $addFields: {
                        template_data: {
                            $concatArrays: [
                                {
                                    $map: {
                                        input: '$months1',
                                        as: 'm1',
                                        in: {
                                            count: 0,
                                            month_year: {
                                                $concat: [
                                                    {
                                                        $arrayElemAt: [monthsArray, { $subtract: ['$$m1', 1] }],
                                                    },
                                                    '-',
                                                    '$start_year',
                                                ],
                                            },
                                        },
                                    },
                                },
                                {
                                    $map: {
                                        input: '$months2',
                                        as: 'm2',
                                        in: {
                                            count: 0,
                                            month_year: {
                                                $concat: [
                                                    {
                                                        $arrayElemAt: [monthsArray, { $subtract: ['$$m2', 1] }],
                                                    },
                                                    '-',
                                                    '$end_year',
                                                ],
                                            },
                                        },
                                    },
                                },
                            ],
                        },
                    },
                },
                {
                    $addFields: {
                        data: {
                            $map: {
                                input: '$template_data',
                                as: 't',
                                in: {
                                    k: '$$t.month_year',
                                    v: {
                                        $reduce: {
                                            input: '$data',
                                            initialValue: 0,
                                            in: {
                                                $cond: [
                                                    { $eq: ['$$t.month_year', '$$this.k'] },
                                                    { $add: ['$$this.v', '$$value'] },
                                                    { $add: [0, '$$value'] },
                                                ],
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                {
                    $project: {
                        data: { $arrayToObject: '$data' },
                        _id: 0,
                    },
                },
            ],
            function (err, result) {
                if (err) {
                    res.send(err)
                } else {
                    res.json(result)
                }
            }
        )
    })

    ProtectedRoutes.route('/weekdayIssueCount').get(async function (req, res) {
        const daysArray = ['Man', 'Tirs', 'Ons', 'Tors', 'Fre', 'Lør', 'Søn']

        const startOfWeek = moment().startOf('isoWeek').toDate()
        const endOfWeek = moment().endOf('isoWeek').toDate()

        const initialDays = daysArray.reduce((acc, day) => {
            acc[day] = 0
            return acc
        }, {})

        try {
            const result = await Data.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: startOfWeek,
                            $lte: endOfWeek,
                        },
                    },
                },
                {
                    $project: {
                        weekDay: {
                            $isoDayOfWeek: '$createdAt',
                        },
                    },
                },
                {
                    $group: {
                        _id: '$weekDay',
                        count: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: { _id: 1 },
                },
                {
                    $project: {
                        _id: 0,
                        weekDayIndex: '$_id',
                        count: '$count',
                    },
                },
                {
                    $addFields: {
                        weekDay: {
                            $arrayElemAt: [daysArray, { $subtract: ['$weekDayIndex', 1] }],
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        data: {
                            $push: {
                                k: '$weekDay',
                                v: '$count',
                            },
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        data: {
                            $arrayToObject: '$data',
                        },
                    },
                },
                {
                    $addFields: {
                        data: {
                            $mergeObjects: [initialDays, '$data'],
                        },
                    },
                },
            ])

            const responseData = result.length > 0 ? result[0].data : initialDays

            res.json(responseData)
        } catch (err) {
            res.status(500).send(err.message)
        }
    })

    ProtectedRoutes.route('/dailyIssueCount').get(async function (req, res) {
        const oneDay = 1000 * 60 * 60 * 24
        const oneWeek = oneDay * 7

        const timeZone = 'Europe/Oslo'

        const now = moment.tz(timeZone)
        const endOfToday = now.clone().endOf('day').toDate()
        const startOfWeek = now.clone().subtract(6, 'days').startOf('day').toDate()

        const hoursArray = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)

        try {
            const result = await Data.aggregate([
                {
                    $match: {
                        updatedAt: {
                            $gte: startOfWeek,
                            $lte: endOfToday,
                        },
                        status: { $eq: 'Løst' },
                    },
                },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt', timezone: timeZone } },
                            hour: { $hour: { date: '$updatedAt', timezone: timeZone } },
                        },
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: { '_id.date': 1, '_id.hour': 1 },
                },
                {
                    $group: {
                        _id: '$_id.date',
                        hourlyData: {
                            $push: {
                                k: { $concat: [{ $toString: '$_id.hour' }, ':00'] },
                                v: '$count',
                            },
                        },
                    },
                },
                {
                    $addFields: {
                        hourlyData: {
                            $arrayToObject: '$hourlyData',
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        date: '$_id',
                        data: '$hourlyData',
                    },
                },
            ])

            const lastDayData = result.length > 0 ? result[result.length - 1] : null

            if (lastDayData) {
                const completeHourlyData = hoursArray.reduce((acc, hour) => {
                    acc[hour] = lastDayData.data[hour] || 0
                    return acc
                }, {})

                res.json(completeHourlyData)
            } else {
                res.json({})
            }
        } catch (err) {
            res.status(500).send(err.message)
        }
    })

    ProtectedRoutes.route('/countOpenIssues').get(async function (req, res) {
        Data.countDocuments({ status: 'Åpen' }, function (err, result) {
            if (err) {
                res.send(err)
            } else {
                res.json(result)
            }
        })
    })

    ProtectedRoutes.route('/issue/:issueId/comments/:commentId/replies').post(async function (req, res, next) {
        const reply = new Comments(req.body)

        reply.author = req.body.user
        Data.findById(req.params.issueId).then((post) => {
            Promise.all([reply.save(), Comments.findById(req.params.commentId)])
                .then(([reply, comment]) => {
                    comment.comments.unshift(reply._id)
                    return Promise.all([comment.save()])
                })
                .then((response) =>
                    res.json({
                        success: true,
                        data: response,
                    })
                )
                .catch(console.error)
            return post.save()
        })
    })

    ProtectedRoutes.route('/issue/:issueId/comments/:commentId/replies/new').post(async function (req, res) {
        const reply = new Comments(req)
        let index = req.body.reply.index
        reply.author = req.body.reply.userID
        reply.content = req.body.reply.content

        let comments = []

        Data.findById(req.params.commentId)
            .lean()
            .then((issue) => {
                Promise.all([reply.save(), Comments.findById(req.params.commentId)])
                    .then(([reply, comment]) => {
                        comment.comments.splice(index, 0, reply)
                        comments = comment
                        return Promise.all([comment.save()])
                    })
                    .then((result) => {
                        Promise.all([
                            Data.findById(req.params.issueId).populate({
                                path: 'comments',
                            }),
                        ]).then((result) => {
                            return res.json({
                                success: true,
                                response: result,
                            })
                        })
                    })
                    .catch(console.error)
            })
    })

    ProtectedRoutes.route('/get-comments/:id').get(async function (req, res) {
        const currentUser = req.body.user
        try {
            await Data.findById(req.params.id)
                .populate({
                    path: 'comments',
                })
                .lean()
                .then((response) => {
                    res.json({
                        success: true,
                        data: { response, currentUser },
                    })
                })
        } catch (e) {
            res.status(500).send('database error ' + e)
        }
    })

    ProtectedRoutes.route('/edituser/:id').post(async function (req, res, next) {
        const { id } = req.params
        const { role, update } = req.body
        const permission = ac.can(role).readAny('editusers')
        if (permission.granted) {
            User.findByIdAndUpdate({ _id: id }, update, (err) => {
                if (err || !update) return res.status(400).json(err)
                res.json(permission.filter(update))
            })
        } else {
            res.status(403).end()
        }
    })

    ProtectedRoutes.route('/removeUser/:id').post(async function (req, res) {
        const { id } = req.params
        User.findByIdAndRemove({ _id: id }, (err) => {
            if (err) return res.status(400).json(err)
            return res.json({ success: true })
        })
    })

    ProtectedRoutes.route('/delete-comment/:id').post(async function (req, res) {
        const { id } = req.params
        const { commentId } = req.body
        Data.findByIdAndUpdate({ _id: id }, { $pullAll: { comments: [commentId] } }, { new: true }, (err, result) => {
            if (err) return res.send(err)
            return res.json({ success: true, response: result })
        }).populate({ path: 'comments' })
    })

    ProtectedRoutes.route('/delete-reply/:id').post(async function (req, res) {
        const { id } = req.params
        const { parentId, childId } = req.body
        await Comments.findByIdAndUpdate({ _id: parentId }, { $pullAll: { comments: [childId] } }, { new: true })
            .clone()
            .then((result) => {
                Promise.all([Data.findById(id).populate({ path: 'comments' })]).then((result) => {
                    return res.json({ success: true, response: result })
                })
            })
            .catch(console.error)
    })

    ProtectedRoutes.route('/update-comment/:id').post(async function (req, res) {
        const { id } = req.params
        const { commentId, newContent } = req.body.comment
        await Comments.findByIdAndUpdate({ _id: commentId }, newContent[0])
            .clone()
            .then((result) => {
                Promise.all([Data.findById(id).populate({ path: 'comments' })]).then((result) => {
                    return res.json({ success: true, response: result })
                })
            })
            .catch(console.error)
    })

    ProtectedRoutes.post('/issue/comments/:id', async function (req, res) {
        const comment = new Comments(req.body)
        comment
            .save()
            .then(() => Promise.all([Data.findById(req.params.id)]))
            .then(([issue]) => {
                issue.comments.unshift(comment)
                return Promise.all([issue.save()])
            })
            .then((response) => {
                res.json({ success: true, data: response })
            })
            .catch((err) => {
                console.log(err)
            })
    })

    app.use('/api', ProtectedRoutes)

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
