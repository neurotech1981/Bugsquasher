import express from 'express'
import {
    createTeam,
    getUserTeams,
    getAllTeams,
    getTeamById,
    updateTeam,
    addTeamMember,
    removeTeamMember,
    updateMemberRole,
    deleteTeam,
    getTeamStats
} from '../controllers/team.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticateToken)

// Team CRUD operations
router.post('/new-team/', createTeam)
router.get('/list/', getAllTeams)  // Changed to get all teams for project assignment
router.get('/user-teams/', getUserTeams)  // Moved user-specific teams to new endpoint
router.get('/stats/', getTeamStats)
router.get('/:teamId', getTeamById)
router.put('/:teamId', updateTeam)
router.delete('/:teamId', deleteTeam)

// Team member management
router.post('/:teamId/members/', addTeamMember)
router.delete('/:teamId/members/:memberId', removeTeamMember)
router.put('/:teamId/members/:memberId/role', updateMemberRole)

export default router