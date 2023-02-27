import express from 'express'
import { createProject, getProjects, getProject, updateProject, deleteProject } from '../controllers/project.js'

const router = express.Router()

router.route('/api/project/new-project').post(createProject)
router.route('/api/project/list').get(getProjects)
router.route('/api/project/view/:id').get(getProject)
router.route('/api/project/update/:id').post(updateProject)
router.route('/api/project/delete/:id').get(deleteProject)

export default router
