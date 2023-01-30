import React, { useState } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { CardActions } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { Redirect } from "react-router-dom";
import { forgotPassword } from "../../../src/components/utils/api-user";
import useReactRouter from "use-react-router";
import VpnKeyIcon from "@material-ui/icons/VpnKey";
import Box from "@material-ui/core/Box";
import { withRouter } from "react-router-dom";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import { AlertTitle } from "@material-ui/lab";

function Alert(props) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <MuiAlert elevation={1} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  root: {
    margin: "0 auto",
  },
  button: {
    margin: theme.spacing(1),
    "&:hover": {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      backgroundColor: "#FFF00",
      color: "white",
    },
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  card: {
    maxWidth: 600,
    margin: "auto",
    textAlign: "center",
    marginTop: theme.spacing(15),
    paddingBottom: theme.spacing(2),
  },
  error: {
    verticalAlign: "middle",
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
}));

function ResetPassword(props) {
  const initialState = {
    email: "",
    error: "",
    message: "",
  };

  const [values, setValues] = useState(initialState);
  const [open, setOpen] = useState(false);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
    goHome();
  };

  //const history = useHistory();

  const goHome = () => {
    props.history.push("/signin");
  };

  const successAlert = () => (
    <Snackbar open={open} autoHideduration={3000} onClose={handleClose}>
      <Alert onClose={handleClose} severity="success" variant="standard">
        <AlertTitle>Suksess</AlertTitle>
        {values.message}
      </Alert>
    </Snackbar>
  );

  const clickSubmit = () => {
    const user = {
      email: values.email || undefined,
    };

    forgotPassword(user).then((data) => {
      if (data.error) {
        setValues({ error: data.error });
      } else {
        setValues({ message: data.message });
        setOpen(true);
      }
    });
    setValues({ email: "" });
  };

  const handleChange = (name) => (event) => {
    setValues({
      ...values,
      [name]: event.target.value,
    });
  };

  const classes = useStyles();

  const { from } = props.location.state || {
    from: {
      pathname: "/",
    },
  };
  if (values.redirectToReferrer) {
    return <Redirect to={from} />;
  }

  return (
    <form className={classes.root} noValidate>
      <Card className={classes.card}>
        <CardContent>
          <Typography
            type="headline"
            variant="h3"
            gutterBottom
            className={classes.title}
          >
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
            onChange={handleChange("email")}
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
            <Button
              color="default"
              variant="contained"
              onClick={goHome}
              className={classes.button}
            >
              Gå tilbake
            </Button>
            {successAlert()}
          </Box>
        </CardActions>
      </Card>
    </form>
  );
}

export default withRouter(ResetPassword);
