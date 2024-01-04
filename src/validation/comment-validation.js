/* eslint-disable no-undef */
const validator = require('validator')
// eslint-disable-next-line no-underscore-dangle
const _isEmpty = require('./is-empty')

// eslint-disable-next-line no-undef
module.exports = function validateCommentInput(data) {
  const errors = {}
  console.log('Inside validation for comment', data)
  data.body = !_isEmpty(data.body) ? data.body : ''

  if (validator.isEmpty(data.body)) {
    errors.body = 'Kommentar er påkrevd'
  }

  return {
    errors,
    isValid: _isEmpty(errors),
  }
}
