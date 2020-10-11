import mongoose from 'mongoose'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
const Schema = mongoose.Schema

const saltRounds = 10;

const userSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: 'Brukernavn er påkrevd'
  },
  email: {
    type: String,
    trim: true,
    unique: 'E-posten eksisterer allerede',
    match: [/.+\@.+\..+/, 'Vennligst fyll ut en gyldig e-post'],
    required: 'E-post er påkrevd'
  },
  hashedPassword: {
    type: String,
    required: 'Passord er påkrevd'
  },
  role: {
    type: String,
    default: 'bruker',
    enum: ['bruker', 'admin']
  },
  rights: {
    type: String,
    default: 'les',
    enum: ['les', 'skriv']
  },
  salt: {
    type: String
  }
})

userSchema
  .virtual('password')
  .set(function (password) {
    this._password = password
    this.salt = bcrypt.genSaltSync(saltRounds);
    //this.salt = this.makeSalt()
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
      var hashed = bcrypt.hashSync(password, this.salt);
      return hashed;
      //crypto
      //  .createHmac('sha256', this.salt)
      //  .update(password)
      //  .digest('hex')
    } catch (err) {
      return ''
    }
  },
  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + ''
  }
}

userSchema.path('hashedPassword').validate(function (v) {
  if (this.hashedPassword && this._password.length < 6) {
    this.invalidate('password', 'Passord må være minst 6 bokstaver langt.')
  }
  if (this.isNew && !this._password) {
    this.invalidate('password', 'Passord er påkrevd.')
  }
}, null)

module.exports = mongoose.model('User', userSchema)
