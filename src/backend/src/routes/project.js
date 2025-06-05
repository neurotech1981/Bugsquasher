import express from 'express'
import Project from '../models/project.js'

const router = express.Router()

// Get all projects
router.get('/list', async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('teamMembers.user', 'name email')
            .populate({
                path: 'assignedTeams.team',
                populate: {
                    path: 'members.user',
                    select: 'name email'
                }
            })
        res.json({ success: true, data: projects })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

// Get a single project
router.get('/view/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('teamMembers.user', 'name email')
            .populate({
                path: 'assignedTeams.team',
                populate: {
                    path: 'members.user',
                    select: 'name email'
                }
            })
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' })
        }
        res.json({ success: true, data: project })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

// Create a new project
router.post('/new-project', async (req, res) => {
    try {
        const project = new Project(req.body)
        const newProject = await project.save()
        const populatedProject = await Project.findById(newProject._id)
            .populate('teamMembers.user', 'name email')
            .populate({
                path: 'assignedTeams.team',
                populate: {
                    path: 'members.user',
                    select: 'name email'
                }
            })
        res.status(201).json({ success: true, data: populatedProject })
    } catch (err) {
        res.status(400).json({ success: false, message: err.message })
    }
})

// Update a project
router.post('/update/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('teamMembers.user', 'name email')
            .populate({
                path: 'assignedTeams.team',
                populate: {
                    path: 'members.user',
                    select: 'name email'
                }
            })
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' })
        }
        res.json({ success: true, data: project })
    } catch (err) {
        res.status(400).json({ success: false, message: err.message })
    }
})

// Delete a project
router.get('/delete/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id)
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' })
        }
        res.json({ success: true, message: 'Project deleted' })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

export default router