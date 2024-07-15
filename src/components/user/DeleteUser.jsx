import React, { useState } from 'react'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import DialogContent from '@mui/material/Dialog'
import Delete from '@mui/icons-material/Delete'
import { useNavigate } from 'react-router-dom'
import auth from '../auth/auth-helper'
import { deleteUser } from '../utils/api-user'

export default function DeleteUser(props) {
    const initialState = {
        redirect: false,
        open: false,
    }

    const [values, setValues] = useState(initialState)
    const navigate = useNavigate()

    const clickButton = () => {
        setValues({ open: true })
    }

    const deleteAccount = () => {
        const jwt = auth.isAuthenticated()
        deleteUser(
            {
                userId: props.userId,
            },
            { t: jwt.token }
        )

        auth.signout(() => console.log('deleted'))
        setValues({ redirect: true })
    }

    const handleRequestClose = () => {
        setValues({ open: false })
    }

    if (values.redirect) {
        navigate('/')
    }

    return (
        <span>
            <IconButton aria-label="Delete" onClick={() => clickButton()} color="secondary" size="large">
                <Delete />
            </IconButton>

            <Dialog open={values.open} onClose={() => handleRequestClose()}>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogContent>
                    <DialogContentText>Confirm to delete your account.</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleRequestClose()} color="primary" variant="contained">
                        Cancel
                    </Button>
                    <Button onClick={() => deleteAccount()} color="secondary" autoFocus="autoFocus" variant="contained">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </span>
    )
}
