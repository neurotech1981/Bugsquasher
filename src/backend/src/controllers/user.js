const User = require("../models/user");
const errorHandler = require("../../../helpers/dbErrorHandler");

export const registerUser = (req, res, next) => {
  const user = new User(req.body);
  user.save((err, result) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      });
    }
    res.status(200).json({
      message: "Ny bruker registrert!"
    });
  });
};

export const getUsers = (req, res, next) => {
  User.find((err, data) => {
    if (err)
      return res.json({
        success: false,
        error: err
      });
    return res.json({
      data: data
    });
  });
};

export const findUserById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "Ingen brukere ble funnet med denne ID!"
      });
    }
    req.profile = user;
    next();
  });
};

export const findUserProfile = (req, res) => {
  // eliminate password related fields before sending the user object
  req.profile.hashedPassword = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};
