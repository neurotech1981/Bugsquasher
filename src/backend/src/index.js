// import dependencies
import userRoutes from './routes/user'
import authRoutes from './routes/auth'
import config from '../config/index'
const express = require('express')
const mongoSanitize = require('express-mongo-sanitize');
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const mongoose = require('mongoose')
var Data = require('./models/data')
const User = require('./models/user')
const path = require('path')
const logger = require('morgan')
const multer = require('multer')
var multipart = require('connect-multiparty')
const cookieParser = require('cookie-parser')
const AccessControl = require('accesscontrol')
const rateLimit = require("express-rate-limit")

var graphqlHTTP = require('express-graphql')
var { buildSchema } = require('graphql')

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});


// This is actually how the grants are maintained internally.
const grants = {
  Admin: {
    issues: {
      'create:any': ['*'],
      'read:any': ['*'],
      'update:any': ['*'],
      'delete:any': ['*']
    },
    editusers: {
      'create:any': ['*'],
      'read:any': ['*'],
      'update:any': ['*'],
      'delete:any': ['*']
    }
  },
  Bruker: {
    issues: {
      'create:own': ['*', '!views'],
      'read:own': ['*'],
      'update:own': ['*', '!views'],
      'delete:own': ['*']
    },
    editusers: {
      'create:own': ['*', '!email', '!rights'],
      'read:own': ['*'],
      'update:own': ['*', '!role', '!email', '!rights'],
      'delete:own': ['*', '!email', '!rights']
    }
  }
}

const ac = new AccessControl(grants)

var multipartMiddleware = multipart()

// Multer image storage settings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../assets/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
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
    fileSize: 1024 * 1024 * 20 // Set max size for upload ; Current is 20 Mb
  },
  fileFilter: fileFilter
})

// MongoDB database
// const dbRoute =
const API_PORT = 3001

const validateInput = require('../../validation/input-validation')

// Use the Data object (data) to find all Data records
Data.find(Data)
// connects our back end code with the database
const URI = config.mongoURI
try {
  mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
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

mongoose.Promise = global.Promise;

module.exports = {
    UserAccount: require('../src/models/user'),
    RefreshToken: require('../src/accounts/refresh-tokens'),
    isValidId
};

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

// define the Express app
const app = express()
const router = express.Router()
// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
//  apply limiter to all requests
app.use(
  limiter,
  bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
  })
)
app.use(logger('dev'))
app.use(bodyParser.json({ limit: '50mb' }))
app.use('/uploads', express.static('../assets/uploads'))
// Redirect to react build
app.use(express.static(path.join(__dirname, '../build')))
app.get('/', function (req, res, next) {
  res.sendFile(path.resolve('../build/index.html'))
})
// enhance your app security with Helmet
app.use(helmet())
// Middleware
app.use(express.json())
app.use(mongoSanitize());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
// enable all CORS requests
app.use(cors())

// log HTTP requests
app.use(morgan('combined'))

// ADD routes
app.use('/', userRoutes)
app.use('/', authRoutes)

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: err.name + ':' + err.message })
  }
})

var root = { hello: () => 'Hello world!' }

var schema = buildSchema(`
  type Query {
    me: User
  }
  type User {
    id: ID
    name: String
    email: String
    role: String,
    rights: String
  }
`)

function Query_me (request) {
  return request.auth.user
}

function User_name (user) {
  return user.name
}

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
  })
)

app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'))

router
  .route('/uploadimage', multipartMiddleware)
  .post(upload.array('imageData', 12), function (req, res, next) {
    const file = req.files
    if (!file) {
      const error = new Error('Vennligst velg en fil å laste opp')
      error.httpStatusCode = 400
      return next(error)
    }
    res.send(file)
  })

// this is our get method
// this method fetches all available data in our database
router.get('/getData', (req, res) => {
  Data.find((err, data) => {
    if (err) {
      return res.json({
        success: false,
        error: err
      })
    }
    return res.json({
      success: true,
      data: data
    })
  })
})

router.put('/upDateIssue/:id', (req, res, next) => {
  const { update } = req.body;
  console.log("BODY REQ ISSUE UPDATE: ", req.params.id)
  Data.findByIdAndUpdate(
    { _id: req.params.id },
    { status: req.body.status},
    function (err, data) {
    if (err) return next(err)
      return res.json({
        success: true,
        data: data
      })
  })
})

router.put('/getDataByID/:id', function async (req, res, next) {
  Data.findById(req.params.id, req.body, function (err, post) {
    if (err) return next(err)
    return res.json({
      success: true,
      data: post
    })
  })
})

// this is our old update method
// this method overwrites existing data in our database
router.post('/edituser', function async(req, res) {
  const { _id, role, update } = req.body;
  const permission = ac.can(role).readAny('editusers');
  if (permission.granted) {
    User.findByIdAndUpdate(_id, req.body.update, (err) => {
      if (err || !update) return res.status(400).json(err);
      // filter data by permission attributes and send.
      res.json(permission.filter(update));
    });
  } else {
    // resource is forbidden for this user/role
    res.status(403).end();
  }
});

router.delete('/removeUser', (req, res) => {
  const { _id } = req.body
  User.findByIdAndRemove(_id, (err) => {
    if (err) return res.send(err)
    return res.json({
      success: true
    })
  })
})

// this is our delete method
// this method removes existing data in our database
router.delete('/deleteData', (req, res) => {
  const { id } = req.body
  Data.findByIdAndRemove(id, (err) => {
    if (err) return res.send(err)
    return res.json({
      success: true
    })
  })
})

// this is our create method
// this method adds new data in our database
router.post('/putData', function async (req, res) {
  const { errors, isValid } = validateInput(req.body)
  // Check Validation
  if (!isValid) {
    // If any errors, send 400 with errors object
    return res.status(400).json(errors)
  }

  const data = new Data()
  data.id = req.body.id
  data.name = req.body.name
  data.delegated = req.body.delegated
  data.description = req.body.description
  data.category = req.body.category
  data.environment = req.body.environment
  data.step_reproduce = req.body.step_reproduce
  data.summary = req.body.summary
  data.browser = req.body.browser
  data.visual = req.body.visual
  data.reproduce = req.body.reproduce
  data.severity = req.body.severity
  data.priority = req.body.priority
  data.additional_info = req.body.additional_info
  data.userid = req.body.userid
  data.imageName = req.body.imageName

  data.save((err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err
      })
    }
    return res.status(200).json({
      success: true,
      document: data
    })
  })
})

// api routes
app.use('/accounts', require('./accounts/account.controller'));
// append /api for our http requests
app.use('/api', router)

// start the server
app.listen(API_PORT, () => {
  console.log(`LISTENING ON PORT ${API_PORT}`)
})