/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// import dependencies
import jwt from 'jsonwebtoken'
import Data from './models/issue.js'
import userRoutes from './routes/user.js'
import authRoutes from './routes/auth.js'
import issueRoutes from './routes/issue.js'
import validateCommentInput from '../../validation/comment-validation.js'
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
import moment from 'moment'
import multer from 'multer'
import multipart from 'connect-multiparty'
import cookieParser from 'cookie-parser'
import AccessControl from 'accesscontrol'
import rateLimit from 'express-rate-limit'
import csrf from 'csurf'
import AccountController from './accounts/account.controller.js'
import OS from 'os'
import fs from 'fs'
import cluster from 'cluster'
import process from 'process'
import crypto from 'crypto'
import { Server } from 'socket.io'
import { createServer } from 'http'

const totalCPUs = OS.cpus().length
const uniqueID = crypto.randomBytes(16).toString('hex')
// define the Express app
const app = express()

process.on('unhandledRejection', (rejectionErr) => {
  // Won't execute
  console.log('unhandledRejection Err::', rejectionErr)
  console.log('unhandledRejection Stack::', JSON.stringify(rejectionErr.stack))
})

process.on('uncaughtException', (uncaughtExc) => {
  console.log('uncaughtException Err::', uncaughtExc)
  console.log('uncaughtException Stack::', JSON.stringify(uncaughtExc.stack))
})

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);

process.env.UV_THREADPOOL_SIZE = OS.cpus().length

console.log('Threadpool size set to: ', OS.cpus().length)

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})

// This is actually how the grants are maintained internally.
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

// Multer image storage settings
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
    // rejects storing a file
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

// MongoDB database
// const dbRoute =
const API_PORT = 3001

// Use the Data object (data) to find all Data records
//Data.find(Data)
// connects our back end code with the database
const URI = config.mongoURI
try {
  mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
} catch (error) {
  console.log(error)
}

const db = mongoose.connection

db.once('open', function () {
  console.log('connected to the database')
})

// checks if connection with the database is successful
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

mongoose.Promise = global.Promise

//module.exports = {
//  UserAccount: require("../src/models/user.js"),
//  RefreshToken: require("../src/accounts/refresh-tokens.js"),
//  isValidId,
//};

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id)
}

if (cluster.isPrimary) {
  console.log(`Number of CPUs is ${totalCPUs}`)
  console.log(`Master ${process.pid} is running`)

  const socketServer = createServer()
  const io = new Server(socketServer, {
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

  io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`)

    socket.on('msg', function (msg) {
      console.log('entered!')
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

  socketServer.listen(4000, () => {
    console.log('Socket.IO server listening on port 4000')
  })

  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`)
    console.log("Let's fork another worker!")
    cluster.fork()
  })
} else {
  console.log(`Worker ${process.pid} started`)
  const ProtectedRoutes = express.Router()

  app.set('view engine', 'ejs')

  app.use(cookieParser())
  //app.use(csrf({ cookie: true }));
  //set secret
  app.set('jwtSecret', config.jwtSecret)
  // (optional) only made for logging and
  // bodyParser, parses the request body to be a readable json format
  //  apply limiter to all requests
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
  // Redirect to react build
  let __dirname = path.resolve()
  app.use(express.static(path.join(__dirname, '../build')))

  app.get('/', function (req, res, next) {
    res.sendFile(path.resolve('../build/index.html'))
  })
  // enhance your app security with Helmet
  app.use(helmet())
  // Middleware
  app.use(express.json())
  app.use(mongoSanitize())
  app.use(express.urlencoded({ extended: true }))
  // enable all CORS requests
  app.use(cors())
  app.use(express.static(__dirname + '/public/')) //Don't forget me :(

  // log HTTP requests
  app.use(morgan('combined'))

  app.use('/', authRoutes)

  //app.use(ProtectedRoutes)
  app.use('/accounts', AccountController)
  app.use('/', userRoutes)
  app.use('/', issueRoutes)

  app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
      res.status(401).json({ error: err.name + ':' + err.message })
    }
  })

  ProtectedRoutes.use((req, res, next) => {
    // check header for the token
    //console.log("ProtectedRoutes headers: ", req.headers)
    var token = req.headers.authorization
    console.log('Checking token #1...', token)
    console.log('Route path: ', req.path)
    if (token === undefined) {
      token = req.body.token
      console.log('Retrying...Checking token...', token)
    }

    if (token === undefined) {
      token = req.body.headers.Authorization
      console.log('Retrying...Checking token...', token)
    }

    // decode token
    if (token) {
      // verifies secret and checks if the token is expired
      try {
        jwt.verify(token, app.get('jwtSecret'), (err, decoded) => {
          if (err) {
            console.log('Invalid token')
            return res.json({ message: 'invalid token' })
          } else {
            // if everything is good, save to request for use in other routes
            console.log('Token was accepted...')
            req.decoded = decoded
            next()
          }
        })
      } catch (err) {
        console.log('An error occured: ', err)
      }
    } else {
      // if there is no token
      res.send({
        message: 'No token provided.',
      })
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

  // this is our count issues method
  // this method count all issues in the data model
  ProtectedRoutes.route('/countIssues').get(async function (req, res, next) {
    Data.countDocuments({}, function (err, result) {
      if (err) {
        res.send(err)
      } else {
        res.json(result)
      }
    })
  })

  // Find 5 latest issues.
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
    // Work out days for start of tomorrow and one week before
    const oneDay = 1000 * 60 * 60 * 24,
      oneWeek = oneDay * 7

    let d = Date.now()
    let lastDay = d - (d % oneDay) + oneDay
    let firstDay = lastDay - oneWeek

    var start = moment().startOf('week').format() // set to 12:00 am today
    var end = moment().endOf('week').format() // set to 23:59 pm today

    Data.aggregate(
      [
        {
          $match: {
            createdAt: {
              $gte: new Date(start),
              $lte: new Date(end),
            },
          },
          // Your matching logic
        },
        /* Now grouping users based on _id or id parameter for each day
     from the above match results.

     $createdAt can be replaced by date property present in your database.
     */
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
        // results in here
        if (err) {
          res.send(err)
        } else {
          res.json(result)
        }
      }
    )
  })

  ProtectedRoutes.route('/thisYearIssuesCount').get(async function (req, res) {
    // Work out days for start of tomorrow and one week before
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

    var start = moment().startOf('year').format() // set to 12:00 am today
    var end = moment().endOf('year').format() // set to 23:59 pm today

    Data.aggregate(
      [
        {
          $match: {
            createdAt: {
              $gte: new Date(start),
              $lte: new Date(end),
            },
          },
          // Your matching logic
        },
        /* Now grouping users based on _id or id parameter for each day
     from the above match results.

     $createdAt can be replaced by date property present in your database.
     */
        {
          $group: {
            /*_id : {
                   month: { $month: "$createdAt" },
                   year: { $year: "$createdAt" } },
                   count : {$sum : 1}
           }*/
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
        // results in here
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

    var start = moment().isoWeekday(1).startOf('isoweek').format('YYYY-MM-DD')
    var end = moment().isoWeekday(1).endOf('isoweek').format('YYYY-MM-DD')
    console.log('Weekly count : ', start + '<< >>', end)

    const initialDays = daysArray.reduce((acc, day) => {
      acc[day] = 0
      return acc
    }, {})

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
          $sort: {
            createdAt: 1,
          },
        },
        {
          $project: {
            day: {
              $dayOfMonth: '$createdAt',
            },
            month: {
              $month: '$createdAt',
            },
            year: {
              $year: '$createdAt',
            },
            weekDay: {
              $isoDayOfWeek: '$createdAt',
            },
          },
        },
        {
          $addFields: {
            weekDay: {
              $arrayElemAt: [daysArray, { $subtract: ['$weekDay', 1] }],
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
          $project: {
            _id: 0,
            weekDay: '$_id',
            count: '$count',
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
      ],
      function (err, result) {
        // results in here
        console.log('Weekly sum : ', result)
        if (err) {
          console.log('Weekly issues Error >>>>', err.message, result)
          res.send(err.message)
        } else {
          console.log('Weekly issues >>>>', result)
          res.json(result)
        }
      }
    )
  })

  ProtectedRoutes.route('/dailyIssueCount').get(async function (req, res) {
    // Work out days for start of tomorrow and one week before
    const oneDay = 1000 * 60 * 60 * 24,
      oneWeek = oneDay * 7

    let d = Date.now()
    let lastDay = d - (d % oneDay) + oneDay
    let firstDay = lastDay - oneWeek

    const FIRST_HOUR = 0
    const LAST_HOUR = 24
    const hoursArray = [
      '00:00',
      '01:00',
      '02:00',
      '03:00',
      '04:00',
      '05:00',
      '06:00',
      '07:00',
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
      '20:00',
      '21:00',
      '22:00',
      '23:59',
    ]

    var start = moment().startOf('day').format() // set to  00:00 am today
    var end = moment().endOf('day').format() // set to 23:59 pm today

    console.log('24 hour solved count: ', start + ' <:> ' + end)

    Data.aggregate(
      [
        {
          $match: {
            updatedAt: {
              $gte: new Date(start),
              $lte: new Date(end),
            },
            status: { $eq: 'Løst' },
          },
          // Your matching logic
        },
        /* Now grouping users based on _id or id parameter for each day
       from the above match results.

       $createdAt can be replaced by date property present in your database.
       */
        {
          $group: {
            _id: { year_day: { $substrCP: ['$updatedAt', 0, 25] } },
          },
        },
        {
          $sort: { '_id.year_day': 1 },
        },
        {
          $project: {
            _id: 0,
            count: { $sum: 1 },
            day_year: {
              $concat: [
                {
                  $arrayElemAt: [
                    hoursArray,
                    {
                      $subtract: [{ $toInt: { $substrCP: ['$_id.year_day', 11, 2] } }, 1],
                    },
                  ],
                },
                '-',
                { $substrCP: ['$_id.year_day', 0, 4] },
              ],
            },
          },
        },
        {
          $group: {
            _id: 0,
            data: { $push: { k: '$day_year', v: '$count' } },
          },
        },
        {
          $addFields: {
            start_week: { $substrCP: [start, 0, 4] },
            end_week: { $substrCP: [end, 0, 4] },
            months1: {
              $range: [{ $toInt: { $substrCP: [start, 5, 2] } }, { $add: [LAST_HOUR, 1] }],
            },
            months2: {
              $range: [FIRST_HOUR, { $add: [{ $toInt: { $substrCP: [end, 5, 2] } }, 1] }],
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
                      day_year: {
                        $concat: [
                          {
                            $arrayElemAt: [hoursArray, { $subtract: ['$$m1', 4] }],
                          },
                          '-',
                          '$start_week',
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
                      day_year: {
                        $concat: [
                          {
                            $arrayElemAt: [hoursArray, { $subtract: ['$$m2', 4] }],
                          },
                          '-',
                          '$end_week',
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
                  k: '$$t.day_year',
                  v: {
                    $reduce: {
                      input: '$data',
                      initialValue: 0,
                      in: {
                        $cond: [
                          { $eq: ['$$t.day_year', '$$this.k'] },
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
        // results in here
        if (err) {
          res.send(err.message)
        } else {
          console.log('24 hour count: ' + JSON.stringify(result))
          res.json(result)
        }
      }
    )
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

  // CREATE REPLY
  ProtectedRoutes.route('/issue/:issueId/comments/:commentId/replies').post(async function (req, res, next) {
    // TURN REPLY INTO A COMMENT OBJECT
    const reply = new Comments(req.body)

    reply.author = req.body.user
    // LOOKUP THE PARENT POST
    Data.findById(req.params.issueId).then((post) => {
      // FIND THE CHILD COMMENT
      Promise.all([reply.save(), Comments.findById(req.params.commentId)])
        .then(([reply, comment]) => {
          // ADD THE REPLY
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
      // SAVE THE CHANGE TO THE PARENT DOCUMENT
      return post.save()
    })
  })

  // Create new reply to comment
  ProtectedRoutes.route('/issue/:issueId/comments/:commentId/replies/new').post(async function (req, res) {
    const reply = new Comments(req)
    let index = req.body.reply.index
    reply.author = req.body.reply.userID
    reply.content = req.body.reply.content

    let comments = []

    Data.findById(req.params.commentId)
      .lean()
      .then((issue) => {
        // FIND THE CHILD COMMENT
        Promise.all([reply.save(), Comments.findById(req.params.commentId)])
          .then(([reply, comment]) => {
            // ADD THE REPLY
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
      // database error
      res.status(500).send('database error ' + e)
    }
  })

  // this is our old update method
  // this method overwrites existing data in our database
  ProtectedRoutes.route('/edituser/:id').post(async function (req, res, next) {
    const { id } = req.params
    const { role, update } = req.body
    const permission = ac.can(role).readAny('editusers')
    if (permission.granted) {
      User.findByIdAndUpdate({ _id: id }, update, (err) => {
        if (err || !update) return res.status(400).json(err)
        // filter data by permission attributes and send.
        res.json(permission.filter(update))
      })
    } else {
      // resource is forbidden for this user/role
      res.status(403).end()
    }
  })

  ProtectedRoutes.route('/removeUser/:id').post(async function (req, res) {
    const { id } = req.params
    User.findByIdAndRemove({ _id: id }, (err) => {
      if (err) return res.status(400).json(err)
      return res.json({
        success: true,
      })
    })
  })

  // this is our delete method
  // this method removes existing data in our database
  ProtectedRoutes.route('/delete-comment/:id').post(async function (req, res) {
    const { id } = req.params
    const { commentId } = req.body
    console.log('Delete comment', id, commentId)
    Data.findByIdAndUpdate({ _id: id }, { $pullAll: { comments: [commentId] } }, { new: true }, (err, result) => {
      if (err) return res.send(err)
      return res.json({
        success: true,
        response: result,
      })
    }).populate({
      path: 'comments',
    })
  })

  // this is our delete method
  // this method removes existing data in our database
  ProtectedRoutes.route('/delete-reply/:id').post(async function (req, res) {
    const { id } = req.params
    const { parentId, childId } = req.body
    console.log('Delete reply', id, parentId)
    await Comments.findByIdAndUpdate({ _id: parentId }, { $pullAll: { comments: [childId] } }, { new: true })
      .clone()
      .then((result) => {
        Promise.all([
          Data.findById(id).populate({
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

  // this is our delete method
  // this method removes existing data in our database
  ProtectedRoutes.route('/update-comment/:id').post(async function (req, res) {
    const { id } = req.params
    const { commentId, newContent } = req.body.comment
    console.log('New content', newContent, commentId, id)
    await Comments.findByIdAndUpdate({ _id: commentId }, newContent[0])
      .clone()
      .then((result) => {
        Promise.all([
          Data.findById(id).populate({
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

  // this is our create method
  ProtectedRoutes.post('/issue/comments/:id', async function (req, res) {
    /*  const { errors, isValid } = validateCommentInput(req.body);
  // Check Validation
  if (!isValid) {
    // If any errors, send 400 with errors object
    return res.status(400).json(errors);
  } */
    const comment = new Comments(req.body)
    console.log('Inside new comment')
    comment
      .save()
      .then(() => Promise.all([Data.findById(req.params.id)]))
      .then(([issue]) => {
        issue.comments.unshift(comment)
        return Promise.all([issue.save()])
      })
      .then((response) => {
        res.json({
          success: true,
          data: response,
        })
      })
      .catch((err) => {
        console.log(err)
      })

    /*   comment.save((err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err,
      });
    }
    return res.status(200).json({
      success: true,
      document: comment,
    });
  }); */
  })

  // api routes
  // append /api for our http requests
  app.use('/api', ProtectedRoutes)

  // start the server
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
