import mongoose from 'mongoose'
import config from './index'
import logger from './logger'

const connectWithRetry = async (retries = 5, interval = 5000) => {
    try {
        await mongoose.connect(config.mongoURI, {
            maxPoolSize: 50,
            serverSelectionTimeoutMS: 30000, // 30 seconds
            socketTimeoutMS: 45000, // 45 seconds
            connectTimeoutMS: 30000, // 30 seconds
            heartbeatFrequencyMS: 10000, // 10 seconds
            retryWrites: true,
            w: 'majority',
            retryReads: true,
            autoIndex: true,
            autoCreate: true
        })

        mongoose.connection.on('error', (err) => {
            logger.error('Mongoose connection error:', err)
        })

        mongoose.connection.on('connected', () => {
            logger.info('Mongoose connected to database')
        })

        mongoose.connection.on('disconnected', () => {
            logger.warn('Mongoose disconnected from database')
        })

        mongoose.connection.on('reconnected', () => {
            logger.info('Mongoose reconnected to database')
        })

        // Handle process termination
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close()
                logger.info('Mongoose connection closed through app termination')
                process.exit(0)
            } catch (err) {
                logger.error('Error during mongoose connection closure:', err)
                process.exit(1)
            }
        })

    } catch (error) {
        logger.error('Failed to connect to MongoDB:', error)

        if (retries > 0) {
            logger.info(`Retrying connection in ${interval/1000} seconds... (${retries} attempts remaining)`)
            setTimeout(() => connectWithRetry(retries - 1, interval), interval)
        } else {
            logger.error('Max retries reached. Could not connect to MongoDB.')
            process.exit(1)
        }
    }
}

export async function connectDatabase() {
    await connectWithRetry()
}