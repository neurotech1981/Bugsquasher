import express from 'express'
import { createProject, getProjects, getProject, updateProject, deleteProject } from '../controllers/project.js'

const router = express.Router()

router.route('/api/projects').post(createProject)
router.route('/api/projects/list').get(getProjects)
router.route('/api/projects/view/:id').get(getProject)
router.route('/api/projects/update/:id').put(updateProject)
router.route('/api/projects/delete/:id').delete(deleteProject)

export default router
