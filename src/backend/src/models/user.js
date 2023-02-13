import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
const Schema = mongoose.Schema

const saltRounds = 10

const userSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: 'Brukernavn er påkrevd',
  },
  email: {
    type: String,
    trim: true,
    unique: 'E-posten eksisterer allerede',
    match: [/.+\@.+\..+/, 'Vennligst fyll ut en gyldig e-post'],
    required: 'E-post er påkrevd',
  },
  hashedPassword: {
    type: String,
    select: false,
    required: 'Passord er påkrevd',
  },
  role: {
    type: String,
    // default: 'bruker',
    enum: ['Bruker', 'Admin'],
  },
  rights: {
    type: String,
    enum: ['Les', 'Skriv'],
  },
  salt: {
    type: String,
    select: true,
  },
  profileImage: {
    type: String,
  },
  issues: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Data',
    },
  ],
  verificationToken: {
    type: String,
    select: false,
  },
  verified: Date,
  resetToken: {
    token: String,
    expires: Date,
  },
  passwordReset: Date,
  created: { type: Date, default: Date.now },
  updated: Date,
  socketId: String,
})

userSchema
  .virtual('password')
  .set(function (password) {
    this._password = password
    this.salt = bcrypt.genSaltSync(saltRounds)
    this.hashedPassword = this.encryptedPassword(password)
  })
  .get(function () {
    return this._password
  })

userSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptedPassword(plainText) === this.hashedPassword
  },
  encryptedPassword: function (password) {
    if (!password) return ''
    try {
      const hashed = bcrypt.hashSync(password, this.salt)
      return hashed
    } catch (err) {
      return ''
    }
  },
  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + ''
  },
}

userSchema
  .virtual('passwordConfirmation')
  .get(function () {
    return this._passwordConfirmation
  })
  .set(function (value) {
    this._passwordConfirmation = value
  })

// userSchema.path('hashedPassword').validate(function (v) {
//  if (this.hashedPassword && this._password.length < 6) {
//    this.invalidate('password', 'Passord må være minst 6 bokstaver langt.')
//  }
//  if (this.isNew && !this._password) {
//    this.invalidate('password', 'Passord er påkrevd.')
//  }
//  if (this._password !== this._passwordConfirmation) {
//    this.invalidate('passwordConfirmation', 'Passord må være like.');
//  }
// }, null)

userSchema.virtual('isVerified').get(function () {
  return !!(this.verified || this.passwordReset)
})

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    // delete ret.hashedPassword;
    delete ret.salt
  },
})

//module.exports = mongoose.model("User", userSchema);

export default mongoose.model('User', userSchema)

export function findByIdAndRemove(arg0, arg1) {
  throw new Error('Function not implemented.')
}
