import express, { Request, Response } from 'express'
import Data from '../models/issue.js'
import Project from '../models/project.js'
import User from '../models/User.js'

const router = express.Router()

// Search across all entities (issues, projects, users)
router.get('/', async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string

        if (!query || query.length < 2) {
            return res.json({
                issues: [],
                projects: [],
                users: []
            })
        }

        // Create case-insensitive regex for search
        const searchRegex = new RegExp(query, 'i')

        // Search in parallel for better performance
        const [issues, projects, users] = await Promise.all([
            // Search issues by summary, description, status
            Data.find({
                $or: [
                    { summary: { $regex: searchRegex } },
                    { description: { $regex: searchRegex } },
                    { status: { $regex: searchRegex } },
                    { priority: { $regex: searchRegex } },
                    { category: { $regex: searchRegex } }
                ]
            })
            .select(['_id', 'summary', 'status', 'priority', 'createdAt'])
            .sort({ createdAt: -1 })
            .limit(10)
            .exec(),

            // Search projects by title, description
            Project.find({
                $or: [
                    { title: { $regex: searchRegex } },
                    { description: { $regex: searchRegex } }
                ]
            })
            .select(['_id', 'title', 'description', 'createdAt'])
            .sort({ createdAt: -1 })
            .limit(10)
            .exec(),

            // Search users by name, email
            User.find({
                $or: [
                    { name: { $regex: searchRegex } },
                    { email: { $regex: searchRegex } }
                ]
            })
            .select(['_id', 'name', 'email'])
            .limit(10)
            .exec()
        ])

        res.json({
            issues: issues || [],
            projects: projects || [],
            users: users || []
        })

    } catch (error) {
        console.error('Search error:', error)
        res.status(500).json({
            error: 'Search failed',
            issues: [],
            projects: [],
            users: []
        })
    }
})

// Search only issues
router.get('/issues', async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string

        if (!query || query.length < 2) {
            return res.json([])
        }

        const searchRegex = new RegExp(query, 'i')

        const issues = await Data.find({
            $or: [
                { summary: { $regex: searchRegex } },
                { description: { $regex: searchRegex } },
                { status: { $regex: searchRegex } },
                { priority: { $regex: searchRegex } },
                { category: { $regex: searchRegex } }
            ]
        })
        .select(['_id', 'summary', 'status', 'priority', 'createdAt'])
        .sort({ createdAt: -1 })
        .limit(20)
        .exec()

        res.json(issues || [])

    } catch (error) {
        console.error('Issues search error:', error)
        res.status(500).json([])
    }
})

// Search only projects
router.get('/projects', async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string

        if (!query || query.length < 2) {
            return res.json([])
        }

        const searchRegex = new RegExp(query, 'i')

        const projects = await Project.find({
            $or: [
                { title: { $regex: searchRegex } },
                { description: { $regex: searchRegex } }
            ]
        })
        .select(['_id', 'title', 'description', 'createdAt'])
        .sort({ createdAt: -1 })
        .limit(20)
        .exec()

        res.json(projects || [])

    } catch (error) {
        console.error('Projects search error:', error)
        res.status(500).json([])
    }
})

// Search only users
router.get('/users', async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string

        if (!query || query.length < 2) {
            return res.json([])
        }

        const searchRegex = new RegExp(query, 'i')

        const users = await User.find({
            $or: [
                { name: { $regex: searchRegex } },
                { email: { $regex: searchRegex } }
            ]
        })
        .select(['_id', 'name', 'email'])
        .limit(20)
        .exec()

        res.json(users || [])

    } catch (error) {
        console.error('Users search error:', error)
        res.status(500).json([])
    }
})

export default router