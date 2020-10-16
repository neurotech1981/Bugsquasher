const User = require('../models/user')
const db = require('../index')
const errorHandler = require('../../../helpers/dbErrorHandler')
const Role = require('../../../helpers/role');
const Rights = require('../../../helpers/rights');


export const registerUser = async (req, res, next) => {
  const user = new User(req.body)
  console.log("Controller USER: ", user)

    const isFirstAccount = (await User.countDocuments({})) === 0;
    user.role = isFirstAccount ? Role.Admin : Role.Bruker;
    user.rights = isFirstAccount ? Rights.Skriv : Rights.Les;
    //User.verificationToken = randomTokenString()

  user.save((err, result) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
    res.status(200).json({
      message: 'Ny bruker registrert!'
    })
  })
}

export const getUsers = (req, res, next) => {
  User.find((err, data) => {
    if (err) {
      return res.json({
        success: false,
        error: err
      })
    }
    return res.json({
      data: data
    })
  })
}

export const findUserById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'Fant ingen brukere med denne ID!'
      })
    }
    req.profile = user
    next()
  })
}

export const findUserProfile = (req, res) => {
  // eliminate password related fields before sending the user object
  req.profile.hashedPassword = undefined
  req.profile.salt = undefined
  return res.json(req.profile)
}
