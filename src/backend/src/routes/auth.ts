import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from '../models/User'
import { AppError } from '../utils/AppError'
import config from '../config'

const router = express.Router()

// Debug route - list all users (temporary)
router.get('/debug/users', async (req, res) => {
    try {
        const users = await User.find().select('email name role')
        res.json({ users })
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' })
    }
})

// Sign in route
router.post('/signin', async (req, res, next) => {
    try {
        console.log('Signin attempt:', { email: req.body.email })
        const { email, password } = req.body

        // Find user with case-insensitive email
        const user = await User.findOne({
            email: { $regex: new RegExp(`^${email}$`, 'i') }
        }).select('+password +hashedPassword +salt')

        console.log('User found:', user ? {
            id: user._id,
            email: user.email,
            hasPassword: !!user.password,
            hasHashedPassword: !!user.hashedPassword,
            hasSalt: !!user.salt
        } : 'No')

        if (!user) {
            console.log('No user found with email:', email)
            throw new AppError('Invalid email or password', 401)
        }

        // Try both authentication methods
        let isMatch = false

        // Try new bcrypt method
        if (user.password) {
            console.log('Attempting bcrypt password comparison')
            isMatch = await user.comparePassword(password)
            console.log('Bcrypt password match:', isMatch)
        }

        // Try old hashedPassword method if bcrypt failed
        if (!isMatch && user.hashedPassword && user.salt) {
            console.log('Attempting old password authentication')
            isMatch = user.authenticate(password)
            console.log('Old password match:', isMatch)
        }

        if (!isMatch) {
            console.log('Password mismatch for user:', email)
            throw new AppError('Invalid email or password', 401)
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            config.jwtSecret,
            { expiresIn: '24h' }
        )

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        })

        // Send response
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        })
    } catch (error) {
        console.error('Signin error:', error)
        next(error)
    }
})

// Sign out route
router.post('/signout', (req, res) => {
    res.clearCookie('token')
    res.json({ message: 'Signed out successfully' })
})

// Get current user route
router.get('/me', async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1]

        if (!token) {
            throw new AppError('Not authenticated', 401)
        }

        const decoded = jwt.verify(token, config.jwtSecret) as { userId: string }
        const user = await User.findById(decoded.userId).select('-password')

        if (!user) {
            throw new AppError('User not found', 404)
        }

        res.json({ user })
    } catch (error) {
        next(error)
    }
})

export default router