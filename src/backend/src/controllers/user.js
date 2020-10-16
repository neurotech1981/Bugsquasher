const User = require('../models/user')
const db = require('../index')
const errorHandler = require('../../../helpers/dbErrorHandler')
const Role = require('../../../helpers/role');
const Rights = require('../../../helpers/rights');
const sendEmail = require('../../../helpers/send-email');
const crypto = require("crypto");
const bcrypt = require('bcrypt');

export const registerUser = async (req, res, next) => {
  const user = new User(req.body)
  console.log("Controller USER: ", user)

    const isFirstAccount = (await User.countDocuments({})) === 0
    user.role = isFirstAccount ? Role.Admin : Role.Bruker
    user.rights = isFirstAccount ? Rights.Skriv : Rights.Les
    user.verificationToken = randomTokenString()

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

    await sendVerificationEmail(user, "localhost");
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

export async function forgotPassword({ email }, origin) {
    const account = await User.findOne({ email });

    // always return ok response to prevent email enumeration
    if (!account) return;

    // create reset token that expires after 24 hours
    account.resetToken = {
        token: randomTokenString(),
        expires: new Date(Date.now() + 24*60*60*1000)
    };
    await account.save();

    // send email
    await sendPasswordResetEmail(account, origin);
}

export async function refreshToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    const { account } = refreshToken;

    // replace old refresh token with a new one and save
    const newRefreshToken = generateRefreshToken(account, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    // generate new jwt
    const jwtToken = generateJwtToken(account);

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}

export async function getRefreshToken(token) {
    const refreshToken = await db.RefreshToken.findOne({ token }).populate('account');
    if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
    return refreshToken;
}

export async function resetPassword({ token, password }) {
    const account = await User.findOne({
        'resetToken.token': token,
        'resetToken.expires': { $gt: Date.now() }
    });

    if (!account) throw 'Invalid token';

    console.log("PASSWORD RESET: ", password)
    // update password and remove reset token
    account.hashedPassword = hash(password, account.salt);
    account.passwordReset =  Date.now();
    account.resetToken = undefined;
    await account.save();
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function hash(password, salt) {
    return bcrypt.hashSync(password, salt);
}

export async function sendVerificationEmail(account, origin) {
    let message;
    if (origin) {
        const verifyUrl = `${origin}/account/verify-email?token=${account.verificationToken}`;
        message = `<p>Please click the below link to verify your email address:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to verify your email address with the <code>/account/verify-email</code> api route:</p>
                   <p><code>${account.verificationToken}</code></p>`;
    }

    await sendEmail({
        to: account.email,
        subject: 'Sign-up Verification API - Verify Email',
        html: `<h4>Verify Email</h4>
               <p>Thanks for registering!</p>
               ${message}`
    });
}

export async function sendAlreadyRegisteredEmail(email, origin) {
    let message;
    if (origin) {
        message = `<p>If you don't know your password please visit the <a href="${origin}/account/forgot-password">forgot password</a> page.</p>`;
    } else {
        message = `<p>If you don't know your password you can reset it via the <code>/account/forgot-password</code> api route.</p>`;
    }

    await sendEmail({
        to: email,
        subject: 'Sign-up Verification API - Email Already Registered',
        html: `<h4>Email Already Registered</h4>
               <p>Your email <strong>${email}</strong> is already registered.</p>
               ${message}`
    });
}

export async function sendPasswordResetEmail(account, origin) {
    let message;
    if (origin) {
        const resetUrl = `${origin}/account/reset-password?token=${account.resetToken.token}`;
        message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to reset your password with the <code>/account/reset-password</code> api route:</p>
                   <p><code>${account.resetToken.token}</code></p>`;
    }

    await sendEmail({
        to: account.email,
        subject: 'Sign-up Verification API - Reset Password',
        html: `<h4>Reset Password Email</h4>
               ${message}`
    });
}