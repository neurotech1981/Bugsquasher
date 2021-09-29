import React from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { useForm, Controller } from "react-hook-form";
import { Typography } from "@material-ui/core";
import auth from "../auth/auth-helper";
import useReactRouter from "use-react-router";
import issueService from "../../services/issueService";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "left",
    alignItems: "left",
    padding: theme.spacing(0),
    "& .MuiTextField-root": {
      margin: theme.spacing(0),
      width: "70%  ",
    },
    "& .MuiButtonBase-root": {
      margin: theme.spacing(0),
    },
  },
  commentField: {
    minWidth: "50%",
    backgroundColor: "white",
  },
}));

const CommentForm = () => {
  const { match } = useReactRouter();
  const { id } = match.params;
  const classes = useStyles();
  const { handleSubmit, control } = useForm();
  const history = useHistory();
  const onSubmit = async (data) => {
    const jwt = auth.isAuthenticated();

    let { _id, email, name } = auth.isAuthenticated().user;
    const commentData = {
      issueID: id || undefined,
      creatorID: _id || undefined,
      name: name || undefined,
      email: email || undefined,
      body: data.comment || undefined,
    };
    console.log(commentData);
    await issueService
      .addComment(
        {
          commentData,
        },
        { t: jwt.token }
      )
      .then((response) => {
        setTimeout(() => {
          history.push("/vis-sak/" + id);
        }, 1000);
        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <form className={classes.root} onSubmit={handleSubmit(onSubmit)}>
      <Typography>Ny kommentar</Typography>
      <Controller
        name="comment"
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
            rows={8}
          />
        )}
        rules={{ required: "Du glemte å legge inn din kommentar" }}
      />
      <p>
        <Button type="submit" variant="contained" color="primary">
          Legg inn kommentar
        </Button>
      </p>
    </form>
  );
};

export default CommentForm;
