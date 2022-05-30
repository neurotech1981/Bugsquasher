import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Snackbar from "@material-ui/core/Snackbar";
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import Draggable from 'react-draggable';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';
import { AlertTitle } from "@material-ui/lab";
import MuiAlert from "@material-ui/lab/Alert";
import issueService from "../../services/issueService";
import auth from "../auth/auth-helper";

function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

function Alert(props) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <MuiAlert elevation={0} variant="filled" {...props} />;
}

export default function DeleteCommentReply(props) {
  const { func_reply, id, parentId, childId } = props;

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const SuccessAlert = () => (
    <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
      <Alert onClose={handleClose} severity="success" variant="standard">
        <AlertTitle>Suksess</AlertTitle>
        Kommentaren ble slettet.
      </Alert>
    </Snackbar>
  );

  const deleteCommentReply = (e) => {
    const jwt = auth.isAuthenticated();
    issueService
      .deleteCommentReply(id, parentId, childId, jwt.token)
      .then((data) => {
        console.log("INSIDE COMMENT DATA >>>", data);
        func_reply(data.data.response[0].comments);
        //setComments(data.data.response.comments);
        if (data.data.success) {
          setOpen(true);

          e.preventDefault();
          e.stopPropagation();
        }
      })
      .catch((error) => {
        console.log("Error", error);
      });
  };

  return (
    <div>
      <Tooltip title="Slett">
        <DeleteIcon onClick={handleClickOpen} />
      </Tooltip>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
          Slett svar
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Er du sikker på at du vil slette svar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={(e) => deleteCommentReply(e)}
            variant="contained"
            color="secondary"
          >
            Slett svar
          </Button>
          <Button onClick={handleClose} color="default">
            Avbryt
          </Button>
        </DialogActions>
      </Dialog>
      {SuccessAlert}
    </div>
  );
}
