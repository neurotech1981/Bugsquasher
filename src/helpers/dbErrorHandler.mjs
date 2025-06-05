const getErrorMessage = (err) => {
    let message = ''

    console.log('Error object:', err)
    console.log('Error name:', err.name)
    console.log('Error code:', err.code)
    console.log('Error message:', err.message)

    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = getUniqueErrorMessage(err)
                break
            default:
                message = 'Noe gikk galt med databasen.'
        }
    } else if (err.name === 'ValidationError') {
        // Handle Mongoose validation errors
        const errors = Object.values(err.errors).map(e => e.message)
        message = errors.join(', ')
    } else if (err.errors) {
        // Handle other validation errors
        for (const errName in err.errors) {
            if (err.errors[errName].message) {
                message = err.errors[errName].message
                break // Take the first error message
            }
        }
    } else if (err.message) {
        // Handle generic errors with message
        message = err.message
    } else {
        message = 'En ukjent feil oppstod.'
    }

    console.log('Returned error message:', message)
    return message
}

const getUniqueErrorMessage = (err) => {
    let output
    console.log('Unique error:', err)
    try {
        const fieldName = err.message.substring(err.message.lastIndexOf('.$') + 2, err.message.lastIndexOf('_1'))
        output = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} finnes allerede`
    } catch (ex) {
        output = 'Dette feltet finnes allerede!'
    }
    return output
}

//module.exports = { getErrorMessage, getUniqueErrorMessage }
export default { getErrorMessage, getUniqueErrorMessage }
