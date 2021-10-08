import React from "react";
import { makeStyles } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { useForm, Controller } from "react-hook-form";
import { Typography } from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import { AlertTitle } from "@material-ui/lab";

function Alert(props) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <MuiAlert elevation={1} variant="filled" {...props} />;
}
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "left",
    alignItems: "left",
    padding: theme.spacing(0),
    "& .MuiTextField-root": {
      margin: theme.spacing(0),
      width: "100%  ",
    },
    "& .MuiButtonBase-root": {
      margin: theme.spacing(0),
    },
  },
  commentField: {
    minWidth: "50%",
    backgroundColor: "white",
  },
  commentFieldBtn: {
    minWidth: "50%",
    marginTop: "1rem",
  },
}));

const CommentForm = ({ onSubmit, openNewComment, setOpenNewComment }) => {
  const classes = useStyles();
  const { handleSubmit, control } = useForm();

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenNewComment(false);

  };

  const SuccessAlert = () => (
      <Alert elevation={0} onClose={handleClose} severity="success" variant="standard">
        <AlertTitle>Suksess</AlertTitle>
        Meldingen din er lagt til.
      </Alert>
  )

  return (
    <>
      <form className={classes.root} onSubmit={handleSubmit(onSubmit)}>
        <Typography component={"span"} variant={"body1"}>
          Ny kommentar
        </Typography>
        <Controller
          name="content"
          control={control}
          defaultValue=""
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <TextField
              label="Skriv inn din kommentar her"
              variant="outlined"
              className={classes.commentField}
              value={value}
              onChange={onChange}
              error={!!error}
              helperText={error ? error.message : null}
              type="text"
              multiline
              rows={5}
            />
          )}
          rules={{ required: "Du glemte å legge inn din kommentar" }}
        />
        {openNewComment && (
          <SuccessAlert/>
        )}
        <div className={classes.commentFieldBtn}>
          <Button type="submit" variant="contained" color="primary">
            Post
          </Button>
        </div>
      </form>
    </>
  );
};

export default CommentForm;
