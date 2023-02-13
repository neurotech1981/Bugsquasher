import React, { useState } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Paper from '@mui/material/Paper'
import Draggable from 'react-draggable'
import auth from '../auth/auth-helper'
import issueService from '../../services/issueService'
import DeleteIcon from '@mui/icons-material/Delete'
import Tooltip from '@mui/material/Tooltip'
import { makeStyles } from '@mui/styles'

function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  )
}

const useStyles = makeStyles(() => ({
  icon: {
    margin: 'theme.spacing(1)',
    fontSize: 24,
    position: 'absolute',
    top: '0',
    right: '0',
    cursor: 'pointer',
    color: 'red',
    stroke: 'black',
    strokeWidth: 1,
    '&:hover': {
      color: 'orange',
    },
  },
}))

export default function DraggableDialog(props) {
  const { imageIndex, images, func, issueID, name } = props
  const classes = useStyles()

  const [open, setOpen] = useState(false)

  const removeImage = (imageIndex) => {
    console.log('Image ID', images[imageIndex].id)
    //let array = [...images]
    if (imageIndex !== -1) {
      //array = images.filter((_, index) => index !== imageIndex)
      console.log(images, imageIndex)
      setOpen(false)
      func(imageIndex)
      deleteImage()
    }
  }

  const deleteImage = async () => {
    const jwt = auth.isAuthenticated()
    console.log('Images to delete: ', images[imageIndex])
    console.log(issueID, images[imageIndex].id, jwt.token)
    await issueService
      .deleteImage(issueID, images[imageIndex].id, name, jwt.token)
      .then((response) => {
        console.log(response)
      })
      .catch((e) => {
        console.log('error: ', e)
      })
  }

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <div>
      <Tooltip title="Slett">
        <DeleteIcon
          onClick={handleClickOpen} //removeImage
          className={classes.icon}
        />
      </Tooltip>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
          Slett bilde
        </DialogTitle>
        <DialogContent>
          <DialogContentText>Er du sikker på at du vil slette bildet?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => removeImage(imageIndex)} variant="contained" color="secondary">
            Slett bilde1234
          </Button>
          <Button onClick={handleClose}>
            Avbryt
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
