import React, { useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { CardActions } from '@mui/material'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { makeStyles } from '@mui/styles'
import { useNavigate, useLocation } from 'react-router-dom'
import { forgotPassword } from '../../../src/components/utils/api-user'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import Box from '@mui/material/Box'
import Snackbar from '@mui/material/Snackbar'
import { AlertTitle } from '@mui/lab'
import Alert from '@mui/material/Alert'

const useStyles = makeStyles((theme) => ({
    root: {
        margin: '0 auto',
    },
    button: {
        margin: theme.spacing(1),
        '&:hover': {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            backgroundColor: '#FFF00',
            color: 'white',
        },
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
    card: {
        maxWidth: 600,
        margin: 'auto',
        textAlign: 'center',
        marginTop: theme.spacing(15),
        paddingBottom: theme.spacing(2),
    },
    error: {
        verticalAlign: 'middle',
    },
    title: {
        marginTop: theme.spacing(2),
        color: theme.palette.openTitle,
    },
    textField: {
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
        width: 300,
    },
}))

function ResetPassword() {
    const initialState = {
        email: '',
        error: '',
        message: '',
    }

    const [values, setValues] = useState(initialState)
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }
        setOpen(false)
        goHome()
    }

    const goHome = () => {
        navigate('/signin')
    }

    const successAlert = () => (
        <Snackbar open={open} autohideduration={3000} onClose={handleClose}>
            <Alert onClose={handleClose} severity="success" variant="standard">
                <AlertTitle>Suksess</AlertTitle>
                {values.message}
            </Alert>
        </Snackbar>
    )

    const clickSubmit = () => {
        const user = {
            email: values.email || undefined,
        }

        forgotPassword(user).then((data) => {
            if (data.error) {
                setValues({ error: data.error })
            } else {
                setValues({ message: data.message })
                setOpen(true)
            }
        })
        setValues({ email: '' })
    }

    const handleChange = (name) => (event) => {
        setValues({
            ...values,
            [name]: event.target.value,
        })
    }

    const classes = useStyles()

    const { from } = location.state || {
        from: {
            pathname: '/',
        },
    }
    if (values.redirectToReferrer) {
        return navigate(from)
    }

    return (
        <form className={classes.root} noValidate>
            <Card className={classes.card}>
                <CardContent>
                    <Typography type="headline" variant="h3" gutterBottom className={classes.title}>
                        Glemt passordet ditt?
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                        En lenke med instruksjoner vil bli sendt til din e-post.
                    </Typography>
                    <TextField
                        id="email"
                        type="email"
                        label="E-post"
                        className={classes.textField}
                        value={values.email}
                        onChange={handleChange('email')}
                        margin="normal"
                        autoComplete="email"
                        variant="outlined"
                    />
                    <br />
                </CardContent>
                <CardActions>
                    <Box justifyContent="center">
                        <Button
                            color="primary"
                            variant="contained"
                            onClick={() => clickSubmit()}
                            className={classes.button}
                        >
                            <VpnKeyIcon className={classes.extendedIcon} />
                            Tilbakestill passord
                        </Button>
                        <Button variant="contained" onClick={goHome} className={classes.button}>
                            Gå tilbake
                        </Button>
                        {successAlert()}
                    </Box>
                </CardActions>
            </Card>
        </form>
    )
}

export default ResetPassword
