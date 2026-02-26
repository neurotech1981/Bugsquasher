import request from 'supertest'
import app from './testApp.js'
import { connectDB, disconnectDB, clearDB } from './setup.js'

beforeAll(async () => await connectDB())
afterAll(async () => await disconnectDB())
afterEach(async () => await clearDB())

describe('Messages API', () => {
  let user1Id, user2Id

  beforeEach(async () => {
    await request(app).post('/api/users').send({
      name: 'User One',
      email: 'user1@test.com',
      password: 'Password123',
      passwordConfirmation: 'Password123',
    })
    await request(app).post('/api/users').send({
      name: 'User Two',
      email: 'user2@test.com',
      password: 'Password123',
      passwordConfirmation: 'Password123',
    })
    const usersRes = await request(app).get('/api/userslist/')
    user1Id = usersRes.body.data.find((u) => u.email === 'user1@test.com')._id
    user2Id = usersRes.body.data.find((u) => u.email === 'user2@test.com')._id
  })

  describe('POST /api/messages', () => {
    it('should send a message', async () => {
      const res = await request(app).post('/api/messages').send({
        sender: user1Id,
        recipient: user2Id,
        subject: 'Test Subject',
        content: 'Hello World',
      })
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.subject).toBe('Test Subject')
      expect(res.body.data.sender.name).toBe('User One')
      expect(res.body.data.recipient.name).toBe('User Two')
      expect(res.body.data.read).toBe(false)
    })

    it('should reject message to self', async () => {
      const res = await request(app).post('/api/messages').send({
        sender: user1Id,
        recipient: user1Id,
        subject: 'Self',
        content: 'Self message',
      })
      expect(res.status).toBe(400)
    })

    it('should reject missing fields', async () => {
      const res = await request(app).post('/api/messages').send({
        sender: user1Id,
        recipient: user2Id,
      })
      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/messages/inbox/:userId', () => {
    it('should return inbox messages', async () => {
      await request(app).post('/api/messages').send({
        sender: user1Id,
        recipient: user2Id,
        subject: 'Inbox test',
        content: 'Content',
      })
      const res = await request(app).get(`/api/messages/inbox/${user2Id}`)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].subject).toBe('Inbox test')
    })

    it('should not show messages sent by user in inbox', async () => {
      await request(app).post('/api/messages').send({
        sender: user1Id,
        recipient: user2Id,
        subject: 'Test',
        content: 'Content',
      })
      const res = await request(app).get(`/api/messages/inbox/${user1Id}`)
      expect(res.body.data).toHaveLength(0)
    })
  })

  describe('GET /api/messages/sent/:userId', () => {
    it('should return sent messages', async () => {
      await request(app).post('/api/messages').send({
        sender: user1Id,
        recipient: user2Id,
        subject: 'Sent test',
        content: 'Content',
      })
      const res = await request(app).get(`/api/messages/sent/${user1Id}`)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveLength(1)
    })
  })

  describe('PUT /api/messages/:id/read', () => {
    it('should mark message as read', async () => {
      const sendRes = await request(app).post('/api/messages').send({
        sender: user1Id,
        recipient: user2Id,
        subject: 'Read test',
        content: 'Content',
      })
      const msgId = sendRes.body.data._id
      const res = await request(app).put(`/api/messages/${msgId}/read`)
      expect(res.body.success).toBe(true)
      expect(res.body.data.read).toBe(true)
    })
  })

  describe('GET /api/messages/unread/:userId', () => {
    it('should count unread messages', async () => {
      await request(app).post('/api/messages').send({
        sender: user1Id,
        recipient: user2Id,
        subject: 'Unread 1',
        content: 'Content',
      })
      await request(app).post('/api/messages').send({
        sender: user1Id,
        recipient: user2Id,
        subject: 'Unread 2',
        content: 'Content',
      })
      const res = await request(app).get(`/api/messages/unread/${user2Id}`)
      expect(res.body.success).toBe(true)
      expect(res.body.count).toBe(2)
    })

    it('should not count read messages', async () => {
      const sendRes = await request(app).post('/api/messages').send({
        sender: user1Id,
        recipient: user2Id,
        subject: 'Read',
        content: 'Content',
      })
      await request(app).put(`/api/messages/${sendRes.body.data._id}/read`)
      const res = await request(app).get(`/api/messages/unread/${user2Id}`)
      expect(res.body.count).toBe(0)
    })
  })

  describe('POST /api/messages/:id/delete', () => {
    it('should soft-delete message for recipient', async () => {
      const sendRes = await request(app).post('/api/messages').send({
        sender: user1Id,
        recipient: user2Id,
        subject: 'Delete test',
        content: 'Content',
      })
      const msgId = sendRes.body.data._id
      await request(app).post(`/api/messages/${msgId}/delete`).send({ userId: user2Id })
      const inboxRes = await request(app).get(`/api/messages/inbox/${user2Id}`)
      expect(inboxRes.body.data).toHaveLength(0)

      const sentRes = await request(app).get(`/api/messages/sent/${user1Id}`)
      expect(sentRes.body.data).toHaveLength(1)
    })
  })
})
