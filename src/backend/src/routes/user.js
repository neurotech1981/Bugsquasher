import express from 'express'
import {
  registerUser,
  findUserById,
  findUserProfile,
  getUsers,
  changePassword,
  addComment
} from '../controllers/user'

const router = express.Router()

router.route('/api/users').post(registerUser)
router.route('/api/userslist/').get(getUsers)
router.route('/api/users/:userId').get(findUserProfile)
router.route('/api/change-password').post(changePassword)
router.route('/api/add-comment').post(addComment)
router.param('userId', findUserById)

export default router
