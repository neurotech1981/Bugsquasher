import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import expressJwt from 'express-jwt'
import config from '../../config/index.js'

export const signin = async (req, res) => {
    try {
        console.log('Inside Signin', req.body.email)
        const user = await User.findOne({ email: req.body.email }).select('+hashedPassword +salt')
        console.log('User:', user)

        if (!user) return res.status(401).json({ error: 'Bruker ikke funnet' })

        if (!user.authenticate(req.body.password)) {
            return res.status(401).json({ error: 'Feil E-post eller Passord!' })
        }

        const token = jwt.sign({ _id: user._id }, config.jwtSecret)
        res.cookie('t', token, {
            expire: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            SameSite: 'None',
            secure: false,
        })

        return res.json({ token, user: { _id: user._id, name: user.name, email: user.email } })
    } catch (err) {
        console.error('Error:', err)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}

export const signout = (_req, res) => {
    res.clearCookie('t')
    return res.status(200).json({
        message: 'Du ble logget ut!',
    })
}

export const requireSignin = expressJwt({
    secret: config.jwtSecret,
    userProperty: 'auth',
    algorithms: ['RS256'],
})

export const hasAuthorization = (req, res) => {
    const authorized = req.profile && req.auth && req.profile._id === req.auth._id
    if (!authorized) {
        return res.status(403).json({
            error: 'You are not authorized!',
        })
    }
}
