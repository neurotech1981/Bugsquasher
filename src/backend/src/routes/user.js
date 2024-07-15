import express from 'express'
import accountService from '../controllers/user.js'

const router = express.Router()

router.route('/api/users').post(accountService.registerUser)
router.route('/api/userslist/').get(accountService.getUsers)
router.route('/api/users/:userId').get(accountService.findUserProfile)
router.route('/api/change-password').post(accountService.changePassword)
router.param('userId', accountService.findUserById)

export default router
