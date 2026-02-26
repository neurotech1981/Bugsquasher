/* eslint-env node */
const validator = require('validator')
const _isEmpty = require('./is-empty')

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
