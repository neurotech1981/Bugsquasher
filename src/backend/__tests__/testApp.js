import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from '../src/routes/auth.js'
import userRoutes from '../src/routes/user.js'
import issueRoutes from '../src/routes/issue.js'
import config from '../config/index.js'

const app = express()

app.use(cookieParser())
app.set('jwtSecret', config.jwtSecret)
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use('/', authRoutes)
app.use('/', userRoutes)
app.use('/', issueRoutes)

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: err.name + ':' + err.message })
  } else {
    res.status(500).json({ error: err.message })
  }
})

export default app
