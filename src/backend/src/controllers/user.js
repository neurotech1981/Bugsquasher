import User from '../models/user.js'
import Comment from '../models/comment.js'
import dbErr from '../../../helpers/dbErrorHandler.mjs'
import { Admin, Bruker } from '../../../helpers/role.js'
import { Les, Skriv } from '../../../helpers/rights.js'
import sendEmail from '../../../helpers/send-email.js'
import crypto from 'crypto'
import bcrypt from 'bcrypt'

const { getErrorMessage, getUniqueErrorMessage } = dbErr

const accountService = {
    registerUser: async (req, res, next) => {
        const user = new User(req.body)
        const isFirstAccount = (await User.countDocuments({})) === 0
        const Role = isFirstAccount ? Admin : Bruker
        const Rights = isFirstAccount ? Skriv : Les
        user.role = Role
        user.rights = Rights
        user.verificationToken = randomTokenString()

        user.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: getErrorMessage(err),
                })
            }
            res.status(200).json({
                message: 'Ny bruker registrert!',
            })
        })

        await sendVerificationEmail(user, 'localhost')
        next()
    },

    addComment: async (req, res, next) => {
        console.log('inside comment')

        const comment = new Comment(req.body.commentData)

        comment.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: getErrorMessage(err),
                })
            }
            console.log(result)
            res.status(200).json({
                message: 'Du postet en ny kommentar!',
            })
        })
        next()
    },

    getUsers: (req, res, next) => {
        User.find((err, data) => {
            if (err) {
                return res.json({
                    success: false,
                    error: err,
                })
            }

            return res.json({
                data: data,
            })
        })
    },

    findUserById: (req, res, next, id) => {
        User.findById(id).exec((err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    error: 'Fant ingen brukere med denne ID!',
                })
            }
            req.profile = user
            next()
        })
        next()
    },

    findUserProfile: (req, res) => {
        req.profile.hashedPassword = undefined
        req.profile.salt = undefined
        return res.json(req.profile)
    },

    changePassword: async (req, res, next) => {
        console.log('Inside changePassword')
        console.log(JSON.stringify(req.body))
        const account = await User.findById({
            _id: req.body._id,
        })

        if (!account) throw 'Invalid ID'

        account.hashedPassword = hash(req.body.password, account.salt)
        account.passwordReset = Date.now()
        account.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: getErrorMessage(err),
                })
            }
            return res.status(200).json({
                message: 'Passord ble endret',
            })
        })
    },

    forgotPassword: async ({ email }, origin) => {
        const account = await User.findOne({ email })

        if (!account) return

        account.resetToken = {
            token: randomTokenString(),
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }
        await account.save()

        await sendPasswordResetEmail(account, origin)
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
