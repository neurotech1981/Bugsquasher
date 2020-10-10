const getErrorMessage = (err) => {
  let message = ''
  if (err.code) {
    switch (err.code) {
      case 11000:
      case 11001:
        message = this.getUniqueErrorMessage(err)
        break
      default:
        message = 'Something went wrong.'
    }
  } else {
    // eslint-disable-next-line no-restricted-syntax
    for (const errName in err.errors) {
      if (err.errors[errName].message) message = err.errors[errName].message
    }
  }
  return message
}

// eslint-disable-next-line no-unused-vars
const getUniqueErrorMessage = (err) => {
  let output
  try {
    const fieldName = err.message.substring(
      err.message.lastIndexOf('.$') + 2,
      err.message.lastIndexOf('_1')
    )
    output = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} already exists`
  } catch (ex) {
    output = 'Field Already Exists!'
  }
  return output
}

module.exports = { getErrorMessage }
