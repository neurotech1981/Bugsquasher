import User from '../models/User.js'
import Comment from '../models/comment.js'
import dbErr from '../../../helpers/dbErrorHandler.mjs'
import { Admin, Bruker } from '../../../helpers/role.js'
import { Les, Skriv } from '../../../helpers/rights.js'
import sendEmail from '../../../helpers/send-email.js'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import config from '../../config/index.js'
import dotenv from 'dotenv'

dotenv.config()

const { getErrorMessage, getUniqueErrorMessage } = dbErr

const accountService = {
    registerUser: async (req, res, next) => {
        try {
            console.log('Registration request body:', req.body)

            // Validate password confirmation
            if (req.body.password !== req.body.passwordConfirmation) {
                return res.status(400).json({
                    error: 'Passordene stemmer ikke overens'
                })
            }

            // Remove passwordConfirmation from the data before saving
            const userData = {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            }

            const user = new User(userData)
            const isFirstAccount = (await User.countDocuments({})) === 0
            const Role = isFirstAccount ? Admin : Bruker
            const Rights = isFirstAccount ? Skriv : Les
            user.role = Role
            user.rights = Rights
            user.verificationToken = randomTokenString()

            await user.save()

            // Try to send verification email, but don't fail registration if it fails
            try {
                await sendVerificationEmail(user, 'localhost')
                console.log('Verification email sent successfully')
            } catch (emailError) {
                console.error('Failed to send verification email:', emailError)
                // Continue with successful registration even if email fails
            }

            res.status(200).json({
                message: 'Ny bruker registrert!',
            })

            next()
        } catch (err) {
            console.error('Registration error:', err)
            res.status(400).json({
                error: getErrorMessage(err),
            })
        }
    },

    addComment: async (req, res, next) => {
        try {
            console.log('inside comment')
            const comment = new Comment(req.body.commentData)

            await comment.save()

            res.status(200).json({
                message: 'Du postet en ny kommentar!',
            })

            next()
        } catch (err) {
            res.status(400).json({
                error: getErrorMessage(err),
            })
        }
    },

    getUsers: async (req, res, next) => {
        try {
            console.log('\n=== getUsers Function Called ===')
            console.log(`Time: ${new Date().toISOString()}`)
            console.log('Request details:')
            console.log('- Method:', req.method)
            console.log('- URL:', req.url)
            console.log('- Headers:', JSON.stringify(req.headers, null, 2))
            console.log('- Cookies:', JSON.stringify(req.cookies, null, 2))
            console.log('- Body:', JSON.stringify(req.body, null, 2))

            console.log('Attempting to fetch users from database...')
            const data = await User.find().lean()
            console.log(`Successfully found ${data.length} users`)

            console.log('Sending response...')
            return res.json({
                success: true,
                data: data,
            })
        } catch (err) {
            console.error('\n=== Error in getUsers ===')
            console.error('Error details:', err)
            console.error('Stack trace:', err.stack)
            console.error('=====================\n')
            return res.status(500).json({
                success: false,
                error: 'An error occurred while fetching users.',
            })
        }
    },

    findUserById: async (req, res, next, id) => {
        try {
            console.log('Finding user by ID:', id)
            const user = await User.findById(id)
            if (!user) {
                console.log('No user found with ID:', id)
                return res.status(404).json({
                    error: 'Fant ingen brukere med denne ID!',
                })
            }
            console.log('User found:', user._id)
            req.profile = user
            next()
        } catch (err) {
            console.error('Error in findUserById:', err)
            res.status(500).json({
                error: 'Error finding user',
            })
        }
    },

    findUserProfile: (req, res) => {
        console.log('findUserProfile called, req.profile:', req.profile ? req.profile._id : 'undefined')
        if (!req.profile) {
            return res.status(404).json({
                error: 'User profile not found',
            })
        }
        req.profile.hashedPassword = undefined
        req.profile.salt = undefined
        return res.json(req.profile)
    },

    changePassword: async (req, res, next) => {
        try {
            console.log('Inside changePassword')
            console.log(JSON.stringify(req.body))
            const account = await User.findById(req.body._id)

            if (!account) throw 'Invalid ID'

            account.hashedPassword = hash(req.body.password, account.salt)
            account.passwordReset = Date.now()
            await account.save()

            return res.status(200).json({
                message: 'Passord ble endret',
            })
        } catch (err) {
            return res.status(400).json({
                error: getErrorMessage(err),
            })
        }
    },

    forgotPassword: async ({ email }, origin) => {
        try {
            const account = await User.findOne({ email })

            if (!account) return

            account.resetToken = {
                token: randomTokenString(),
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            }
            await account.save()

            await sendPasswordResetEmail(account, origin)
        } catch (err) {
            console.error('Error during password reset:', err)
        }
    },

    refreshToken: async ({ token, ipAddress }) => {
        const refreshToken = await getRefreshToken(token)
        const { account } = refreshToken

        const newRefreshToken = newRefreshToken(account, ipAddress)
        refreshToken.revoked = Date.now()
        refreshToken.revokedByIp = ipAddress
        refreshToken.replacedByToken = newRefreshToken.token
        await refreshToken.save()
        await newRefreshToken.save()

        const jwtToken = generateJwtToken(account)

        return {
            ...basicDetails(account),
            jwtToken,
            refreshToken: newRefreshToken.token,
        }
    },

    getRefreshToken: async (token) => {
        console.log('TOKEN : ', token)
        const refreshToken = await account.RefreshToken.findOne({ token }).populate('account')
        if (!refreshToken || !refreshToken.isActive) throw 'Invalid token'
        return refreshToken
    },

    resetPassword: async ({ token, password }) => {
        const account = await User.findOne({
            'resetToken.token': token,
            'resetToken.expires': { $gt: Date.now() },
        }).select('hashedPassword salt')

        if (!account) throw 'Invalid token'

        account.hashedPassword = hash(password, account.salt)
        account.passwordReset = Date.now()
        account.resetToken = undefined
        await account.save()
    },

    updateUser: async (req, res) => {
        try {
            console.log('Updating user:', req.params.userId)
            console.log('Update data:', req.body)
            console.log('Request headers:', req.headers)

            // Get token from Authorization header
            const token = req.headers.authorization?.split(' ')[1] || req.cookies.token
            if (!token) {
                return res.status(401).json({
                    success: false,
                    error: 'No token provided'
                })
            }
            // Decode the token to get user information
            const decoded = jwt.verify(token, config.jwtSecret)
            console.log('Decoded token:', decoded)

            const user = await User.findById(req.params.userId)
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                })
            }

            // Get the requesting user's role from the token
            const requestingUser = await User.findById(decoded.userId)
            if (!requestingUser) {
                return res.status(404).json({
                    success: false,
                    error: 'Requesting user not found'
                })
            }

            // Check if the requesting user has admin role
            if (requestingUser.role !== 'Admin') {
                return res.status(403).json({
                    success: false,
                    error: 'Only admins can update users'
                })
            }

            // Update user fields
            user.name = req.body.update.name
            user.email = req.body.update.email
            user.role = req.body.update.role
            user.rights = req.body.update.rights

            await user.save()

            return res.json({
                success: true,
                data: user
            })
        } catch (err) {
            console.error('Error updating user:', err)
            return res.status(500).json({
                success: false,
                error: 'Failed to update user'
            })
        }
    },

    updateOwnProfile: async (req, res) => {
        try {
            console.log('Updating own profile:', req.params.userId)
            console.log('Update data:', req.body)

            // Get token from Authorization header
            const token = req.headers.authorization?.split(' ')[1] || req.cookies.token
            if (!token) {
                return res.status(401).json({
                    success: false,
                    error: 'No token provided'
                })
            }

            // Decode the token to get user information
            const decoded = jwt.verify(token, config.jwtSecret)
            console.log('Decoded token:', decoded)

            // Check if the user is updating their own profile
            if (decoded.userId !== req.params.userId) {
                return res.status(403).json({
                    success: false,
                    error: 'You can only update your own profile'
                })
            }

            const user = await User.findById(req.params.userId)
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                })
            }

            // Update only allowed fields (name and email)
            if (req.body.name) {
                user.name = req.body.name.trim()
            }
            if (req.body.email) {
                // Check if email is already taken by another user
                const existingUser = await User.findOne({
                    email: req.body.email.toLowerCase().trim(),
                    _id: { $ne: req.params.userId }
                })
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        error: 'Email is already in use'
                    })
                }
                user.email = req.body.email.toLowerCase().trim()
            }

            await user.save()

            // Remove sensitive fields before sending response
            const responseUser = user.toObject()
            delete responseUser.hashedPassword
            delete responseUser.salt
            delete responseUser.password

            return res.json({
                success: true,
                data: responseUser,
                message: 'Profile updated successfully'
            })
        } catch (err) {
            console.error('Error updating own profile:', err)
            return res.status(500).json({
                success: false,
                error: 'Failed to update profile'
            })
        }
    }
}


function randomTokenString() {
    return crypto.randomBytes(40).toString('hex')
}

function hash(password, salt) {
    return bcrypt.hashSync(password, salt)
}

async function sendVerificationEmail(account, origin) {
    let message
    if (origin) {
        const verifyUrl = `${origin}/account/verify-email?token=${account.verificationToken}`
        message = `<p>Klikk på lenken nedenfor for å bekrefte e-postadressen din:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`
    } else {
        message = `<p>Bruk token nedenfor for å bekrefte e-postadressen din med <code>/account/verify-email</code> api route:</p>
                   <p><code>${account.verificationToken}</code></p>`
    }

    await sendEmail({
        to: account.email,
        subject: 'Registrering på Bugsquasher.no - Bekreft e-post',
        html: `<h4>Bekreft e-post</h4>
               <p>Takk for at du registrerte deg!</p>
               ${message}`,
    })
}

async function sendAlreadyRegisteredEmail(email, origin) {
    let message
    if (origin) {
        message = `<p>Hvis du ikke vet passordet ditt, kan du gå til <a href="${origin}/account/glemt-passord">glemt passord</a> siden.</p>`
    } else {
        message =
            '<p>Hvis du ikke vet passordet ditt, kan du tilbakestille det via <code>/account/glemt-passord</code> api ruten.</p>'
    }

    await sendEmail({
        to: email,
        subject: 'E-post allerede registrert',
        html: `<h4>E-post allerede registrert</h4>
               <p>Din e-post <strong>${email}</strong> er allerede registrert.</p>
               ${message}`,
    })
}

async function sendPasswordResetEmail(account, origin) {
    let message
    if (origin) {
        const resetUrl = `${origin}/tilbakestill-passord/${account.resetToken.token}`
        message = `<p>Klikk på lenken nedenfor for å tilbakestille passordet ditt, lenken vil være gyldig i 1 dag:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>`
    } else {
        message = `<p>Bruk token nedenfor for å tilbakestille passordet ditt med<code>/account/resett-passord</code> api ruten:</p>
                   <p><code>${account.resetToken.token}</code></p>`
    }

    await sendEmail({
        to: account.email,
        subject: 'Bugsquasher.no - Tilbakestill passord',
        html: `<h4>Resett passord e-post</h4>
               ${message}`,
    })
}

export default accountService
