import React, { useState } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Snackbar from '@mui/material/Snackbar'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import DeleteIcon from '@mui/icons-material/Delete'
import Tooltip from '@mui/material/Tooltip'
import { AlertTitle } from '@mui/lab'
import Alert from '@mui/material/Alert'
import issueService from '../../services/issueService'
import auth from '../auth/auth-helper'

export default function DeleteCommentReply(props) {
  const { func_reply, id, parentId, childId } = props

  const [open, setOpen] = useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const SuccessAlert = () => (
    <Snackbar open={open} autohideduration={3000} onClose={handleClose}>
      <Alert onClose={handleClose} severity="success" variant="standard">
        <AlertTitle>Suksess</AlertTitle>
        Kommentaren ble slettet.
      </Alert>
    </Snackbar>
  )

  const deleteCommentReply = (e) => {
    const jwt = auth.isAuthenticated()
    issueService
      .deleteCommentReply(id, parentId, childId, jwt.token)
      .then((data) => {
        console.log('INSIDE COMMENT DATA >>>', data)
        func_reply(data.data.response[0].comments)
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
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
          Slett svar
        </DialogTitle>
        <DialogContent>
          <DialogContentText>Er du sikker på at du vil slette svar?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={(e) => deleteCommentReply(e)} variant="contained" color="secondary">
            Slett svar
          </Button>
          <Button
            onClick={() => {
              handleClose()
            }}
          >
            Avbryt
          </Button>
        </DialogActions>
      </Dialog>
      {SuccessAlert}
    </div>
  )
}
