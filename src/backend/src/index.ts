import express from 'express'
import cluster from 'cluster'
import os from 'os'
import { configureServer } from './config/server'
import { configureSocketServer } from './config/socket'
import { connectDatabase } from './config/database'
import { errorHandler } from './middleware/errorHandler'
import routes from './routes/index'

const totalCPUs = os.cpus().length
const API_PORT = 3001
const SOCKET_PORT = 4000

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`)

    // Fork workers
    for (let i = 0; i < totalCPUs; i++) {
        cluster.fork()
    }

    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died`)
        cluster.fork()
    })
} else {
    const app = express()

    // Configure server
    configureServer(app)

    // Configure socket server
    const { httpServer } = configureSocketServer(app)

    // Connect to database
    connectDatabase()

    // Mount all routes under /api
    app.use('/api', routes)

    // Error handling middleware should be last
    app.use(errorHandler)

    // Start servers
    httpServer.listen(SOCKET_PORT, '0.0.0.0', () => {
        console.log(`Socket server started on port ${SOCKET_PORT}`)
    })

    app.listen(API_PORT, () => {
        console.log(`API server started on port ${API_PORT}`)
    })
}