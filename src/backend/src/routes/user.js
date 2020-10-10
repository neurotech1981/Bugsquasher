import express from 'express'
import {
  registerUser,
  findUserById,
  findUserProfile,
  getUsers
} from '../controllers/user'

const router = express.Router()

router.route('/api/users').post(registerUser)
router.route('/api/userslist/').get(getUsers)

router.route('/api/users/:userId').get(findUserProfile)

router.param('userId', findUserById)

export default router
