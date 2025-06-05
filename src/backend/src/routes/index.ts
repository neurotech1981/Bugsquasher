import express from 'express'
import authRoutes from './auth.js'
import userRoutes from './user.js'
import issueRoutes from './issue.js'
import projectRoutes from './project.js'
import analyticsRoutes from './analytics.js'
import teamRoutes from './team.js'
import searchRoutes from './search.js'

const router = express.Router()

// Mount all routes
router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/issues', issueRoutes)
router.use('/projects', projectRoutes)
router.use('/analytics', analyticsRoutes)
router.use('/teams', teamRoutes)
router.use('/search', searchRoutes)

export default router