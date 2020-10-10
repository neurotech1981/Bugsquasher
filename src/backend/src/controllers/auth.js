import User from '../models/user'
import jwt from 'jsonwebtoken'
import expressJwt from 'express-jwt'
import config from '../../config/index'

export const signin = (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({
        error: 'Bruker ikke funnet'
      })
    }
    if (!user.authenticate(req.body.password)) {
      return res.status(401).json({
        error: 'Feil E-post eller Passord!'
      })
    }

    const token = jwt.sign(
      {
        _id: user._id
      },
      config.jwtSecret
    )

    res.cookie('t', token, {
      expire: new Date() + 9999
    })

    return res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email }
    })
  })
}

export const signout = (req, res) => {
  res.clearCookie('t')
  return res.status(200).json({
    message: 'Du ble logget ut!'
  })
}

export const requireSignin = expressJwt({
  secret: config.jwtSecret,
  userProperty: 'auth',
  algorithms: ['RS256']
})

export const hasAuthorization = (req, res) => {
  const authorized = req.profile && req.auth && req.profile._id == req.auth._id
  if (!authorized) {
    return res.status(403).json({
      error: 'Bruker er ikke autorisert!'
    })
  }
}
