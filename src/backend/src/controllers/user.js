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
  User.findByIdA(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "Ingen brukere funnet med det brukernavnet"
      });
    }
    req.profile = user;
    next();
  });
};

//export const editUser = (req, res, next) => {
//  try {
//    const update = req.body;
//    const userId = req.params.userId;
//    //User.findByIdAndUpdate(userId, update);
//    User.findByIdAndUpdate(userId, update);
//    console.log("USER >>>>" + user);
//    const user = User.findById(userId);
//    res.status(200).json({
//      data: user,
//      message: "User has been updated"
//    });
//  } catch (error) {
//    next(error);
//  }
//};

export const findUserProfile = (req, res) => {
  // eliminate password related fields before sending the user object
  req.profile.hashedPassword = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

export const deleteUser = (req, res, next) => {
  let user = req.profile;
  user.remove((err, deletedUser) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      });
    }
    deletedUser.hashedPassword = undefined;
    user.salt = undefined;
    res.json(user);
  });
};
