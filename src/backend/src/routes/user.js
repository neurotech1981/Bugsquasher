import express from 'express'
import accountService from '../controllers/user.js'

const router = express.Router()

// Add detailed logging middleware
router.use((req, res, next) => {
    console.log('\n=== User Route Access ===')
    console.log(`Time: ${new Date().toISOString()}`)
    console.log(`Method: ${req.method}`)
    console.log(`URL: ${req.url}`)
    console.log('Headers:', JSON.stringify(req.headers, null, 2))
    console.log('Cookies:', JSON.stringify(req.cookies, null, 2))
    console.log('Body:', JSON.stringify(req.body, null, 2))
    console.log('=====================\n')
    next()
})

// Log all registered routes
console.log('\n=== Registered User Routes ===')

// User routes
router.route('/').post(accountService.registerUser)
console.log('POST / - registerUser')

router.route('/list').get(accountService.getUsers)
console.log('GET /list - getUsers')

router.route('/change-password').post(accountService.changePassword)
console.log('POST /change-password - changePassword')

// User profile routes
router.param('userId', accountService.findUserById)
console.log('Param middleware: userId - findUserById')

router.route('/:userId').get(accountService.findUserProfile)
console.log('GET /:userId - findUserProfile')

router.route('/:userId').put(accountService.updateOwnProfile)
console.log('PUT /:userId - updateOwnProfile')

router.route('/edit/:userId').post(accountService.updateUser)
console.log('POST /edit/:userId - updateUser')

console.log('=====================\n')

export default router
