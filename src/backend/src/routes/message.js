import express from 'express'
import {
  sendMessage,
  getInbox,
  getSent,
  getMessage,
  markAsRead,
  deleteMessage,
  getUnreadCount,
} from '../controllers/message.js'

const router = express.Router()

router.post('/api/messages', sendMessage)
router.get('/api/messages/inbox/:userId', getInbox)
router.get('/api/messages/sent/:userId', getSent)
router.get('/api/messages/unread/:userId', getUnreadCount)
router.get('/api/messages/:id', getMessage)
router.put('/api/messages/:id/read', markAsRead)
router.post('/api/messages/:id/delete', deleteMessage)

export default router
