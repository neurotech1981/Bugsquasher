const validator = require('validator')
// eslint-disable-next-line no-underscore-dangle
const _isEmpty = require('./is-empty')

module.exports = function validateInput (data) {
  const errors = {}

  this.data.name = !_isEmpty(data.name) ? data.name : ''
  this.data.description = !_isEmpty(data.description) ? data.description : ''
  this.data.category = !_isEmpty(data.category) ? data.category : ''
  this.data.step_reproduce = !_isEmpty(data.step_reproduce)
    ? data.step_reproduce
    : ''
  this.data.summary = !_isEmpty(data.summary) ? data.summary : ''
  this.data.reproduce = !_isEmpty(data.reproduce) ? data.reproduce : ''
  this.data.severity = !_isEmpty(data.severity) ? data.severity : ''
  this.data.priority = !_isEmpty(data.priority) ? data.priority : ''
  this.data.additional_info = !_isEmpty(data.additional_info)
    ? data.additional_info
    : ''

  if (validator.isEmpty(data.name)) {
    errors.name = 'Fornavn og etternavn påkrevd'
  }

  if (validator.isEmpty(data.category)) {
    errors.category = 'Velg en kategori på hendelse'
  }

  if (validator.isEmpty(data.severity)) {
    errors.severity = 'En alvorlighetsgrad er påkrevd'
  }

  if (validator.isEmpty(data.priority)) {
    errors.priority = 'Prioritet må angis'
  }

  if (validator.isEmpty(data.reproduce)) {
    errors.reproduce = 'Reproduksjon må angis'
  }

  if (validator.isEmpty(data.description)) {
    errors.description = 'En beskrivelse av hendelse er påkrevd'
  }

  if (validator.isEmpty(data.summary)) {
    errors.summary = 'Gi en oppsummering'
  }

  if (validator.isEmpty(data.step_reproduce)) {
    errors.step_reproduce = 'Beskriv steg for å reprodusere hendelse'
  }

  if (validator.isEmpty(data.additional_info)) {
    errors.additional_info = 'Legg til tilleggs informasjon'
  }

  return {
    errors,
    isValid: _isEmpty(errors)
  }
}
