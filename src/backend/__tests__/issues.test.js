import request from 'supertest'
import app from './testApp.js'
import { connectDB, disconnectDB, clearDB } from './setup.js'

beforeAll(async () => await connectDB())
afterAll(async () => await disconnectDB())
afterEach(async () => await clearDB())

describe('Issues API', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123',
    passwordConfirmation: 'Password123',
  }

  let userId

  beforeEach(async () => {
    await request(app).post('/api/users').send(testUser)
    const loginRes = await request(app).post('/auth/signin').send({
      email: testUser.email,
      password: testUser.password,
    })
    userId = loginRes.body.user._id
  })

  function makeIssue() {
    return {
      data: {
        name: 'Test User',
        description: 'Test bug description',
        category: 'Tekst',
        summary: 'Test bug summary',
        reproduce: 'Alltid',
        severity: 'Mindre alvorlig',
        priority: 'Normal',
        step_reproduce: 'Step 1: Open the page',
        reporter_id: userId,
        userid: userId,
      },
    }
  }

  describe('POST /api/new-issue', () => {
    it('should create a new issue', async () => {
      const res = await request(app).post('/api/new-issue').send(makeIssue())
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.document).toHaveProperty('_id')
      expect(res.body.document.summary).toBe('Test bug summary')
      expect(res.body.document.status).toBe('Åpen')
    })

    it('should reject issue missing required fields', async () => {
      const res = await request(app).post('/api/new-issue').send({
        data: { name: 'Test', description: '', category: '', summary: '', reproduce: '', severity: '', priority: '', step_reproduce: '' },
      })
      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/getData', () => {
    it('should return empty list when no issues', async () => {
      const res = await request(app).get('/api/getData')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveLength(0)
    })

    it('should return all issues', async () => {
      await request(app).post('/api/new-issue').send(makeIssue())
      await request(app).post('/api/new-issue').send(makeIssue())
      const res = await request(app).get('/api/getData')
      expect(res.body.data).toHaveLength(2)
    })
  })

  describe('GET /api/getIssueByID/:id', () => {
    it('should return a specific issue', async () => {
      const createRes = await request(app).post('/api/new-issue').send(makeIssue())
      const issueId = createRes.body.document._id
      const res = await request(app).get(`/api/getIssueByID/${issueId}`)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.summary).toBe('Test bug summary')
    })
  })

  describe('GET /api/upDateIssueStatus/:id/:status', () => {
    it('should update issue status', async () => {
      const createRes = await request(app).post('/api/new-issue').send(makeIssue())
      const issueId = createRes.body.document._id
      const res = await request(app).get(`/api/upDateIssueStatus/${issueId}/Løst`)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)

      const getRes = await request(app).get(`/api/getIssueByID/${issueId}`)
      expect(getRes.body.data.status).toBe('Løst')
    })
  })

  describe('POST /api/upDateIssue/:id', () => {
    it('should update issue fields', async () => {
      const createRes = await request(app).post('/api/new-issue').send(makeIssue())
      const issueId = createRes.body.document._id
      const res = await request(app).post(`/api/upDateIssue/${issueId}`).send({
        dataset: { summary: 'Updated summary', priority: 'Høy' },
      })
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)

      const getRes = await request(app).get(`/api/getIssueByID/${issueId}`)
      expect(getRes.body.data.summary).toBe('Updated summary')
      expect(getRes.body.data.priority).toBe('Høy')
    })
  })

  describe('GET /api/deleteIssueByID/:id', () => {
    it('should delete an issue', async () => {
      const createRes = await request(app).post('/api/new-issue').send(makeIssue())
      const issueId = createRes.body.document._id
      const res = await request(app).get(`/api/deleteIssueByID/${issueId}`)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)

      const getRes = await request(app).get('/api/getData')
      expect(getRes.body.data).toHaveLength(0)
    })
  })
})
