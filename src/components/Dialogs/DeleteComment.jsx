import React, { useState } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Paper from '@mui/material/Paper'
import Draggable from 'react-draggable'
import DeleteIcon from '@mui/icons-material/Delete'
import Tooltip from '@mui/material/Tooltip'
import { AlertTitle } from '@mui/lab'
import issueService from '../../services/issueService'
import auth from '../auth/auth-helper'


export default function DeleteComment(props) {
  const { func, id, commentId } = props

  const [open, setOpen] = useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const SuccessAlert = () => (
    <Snackbar
      open={open}
      autohideduration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity="success" variant="standard">
        <AlertTitle>Suksess</AlertTitle>
        Kommentaren ble slettet.
      </Alert>
    </Snackbar>
  )

  const deleteComment = (e) => {
    const jwt = auth.isAuthenticated()
    issueService
      .deleteComment(id, commentId, jwt.token)
      .then((data) => {
        console.log(data)
        func(data.data.response.comments)
        //setComments(data.data.response.comments);
        if (data.data.success) {
          setOpen(true)

          e.preventDefault()
          e.stopPropagation()
        }
      })
      .catch((error) => {
        console.log('Error', error)
      })
  }

  return (
    <div>
      <Tooltip title="Slett">
        <DeleteIcon onClick={handleClickOpen} />
      </Tooltip>
      <Dialog open={open} onClose={handleClose} aria-labelledby="draggable-dialog-title">
        <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
          Slett kommentar
        </DialogTitle>
        <DialogContent>
          <DialogContentText>Er du sikker på at du vil slette kommentaren?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={(e) => deleteComment(e)} variant="contained" color="error">
            Slett kommentar
          </Button>
          <Button onClick={handleClose}>Avbryt</Button>
        </DialogActions>
      </Dialog>
      {SuccessAlert}
    </div>
  )
}
