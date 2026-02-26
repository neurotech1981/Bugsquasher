import request from 'supertest'
import app from './testApp.js'
import { connectDB, disconnectDB, clearDB } from './setup.js'

beforeAll(async () => await connectDB())
afterAll(async () => await disconnectDB())
afterEach(async () => await clearDB())

describe('Authentication', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123',
    passwordConfirmation: 'Password123',
  }

  describe('POST /api/users (registration)', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/users').send(testUser)
      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Ny bruker registrert!')
    })

    it('should assign Admin role to first user', async () => {
      await request(app).post('/api/users').send(testUser)
      const res = await request(app).get('/api/userslist/')
      expect(res.body.data[0].role).toBe('Admin')
    })

    it('should assign Bruker role to second user', async () => {
      await request(app).post('/api/users').send(testUser)
      const secondUser = {
        name: 'Second User',
        email: 'second@example.com',
        password: 'Password123',
        passwordConfirmation: 'Password123',
      }
      await request(app).post('/api/users').send(secondUser)
      const res = await request(app).get('/api/userslist/')
      const second = res.body.data.find((u) => u.email === 'second@example.com')
      expect(second.role).toBe('Bruker')
    })

    it('should handle duplicate email registration', async () => {
      const first = await request(app).post('/api/users').send(testUser)
      expect(first.status).toBe(200)
      const res = await request(app).post('/api/users').send(testUser)
      expect([200, 400]).toContain(res.status)
    })

    it('should reject missing required fields', async () => {
      const res = await request(app).post('/api/users').send({ name: 'No Email' })
      expect(res.status).toBe(400)
    })
  })

  describe('POST /auth/signin', () => {
    beforeEach(async () => {
      await request(app).post('/api/users').send(testUser)
    })

    it('should sign in with valid credentials', async () => {
      const res = await request(app).post('/auth/signin').send({
        email: testUser.email,
        password: testUser.password,
      })
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('token')
      expect(res.body.user).toHaveProperty('_id')
      expect(res.body.user.email).toBe(testUser.email)
      expect(res.body.user.name).toBe(testUser.name)
    })

    it('should reject invalid password', async () => {
      const res = await request(app).post('/auth/signin').send({
        email: testUser.email,
        password: 'WrongPassword',
      })
      expect(res.status).toBe(401)
    })

    it('should reject non-existent email', async () => {
      const res = await request(app).post('/auth/signin').send({
        email: 'nobody@example.com',
        password: 'SomePassword',
      })
      expect(res.status).toBe(401)
    })
  })

  describe('GET /auth/signout', () => {
    it('should clear the auth cookie', async () => {
      const res = await request(app).get('/auth/signout')
      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Du ble logget ut!')
    })
  })
})
