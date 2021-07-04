/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from "react";
import useReactRouter from "use-react-router";
import { makeStyles } from "@material-ui/core/styles";
import issueService from "../../services/issueService";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Icon from "@material-ui/core/Icon";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Snackbar from "@material-ui/core/Snackbar";
// eslint-disable-neAlertxt-line no-unused-vars
import MuiAlert from "@material-ui/lab/Alert";
import { AlertTitle } from "@material-ui/lab";
import { useSelector } from "react-redux";
import Box from "@material-ui/core/Box";
import Previews from "./ImageUploader";
import auth from "../auth/auth-helper";
import { findUserProfile, getUsers } from "../utils/api-user";

function Alert(props) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <MuiAlert elevation={1} variant="filled" {...props} />;
}

const alvorlighetsGrad = [
  {
    value: 0,
    label: "Ingen valgt",
  },
  {
    value: 1,
    label: "Tekst",
  },
  {
    value: 2,
    label: "Justering",
  },
  {
    value: 3,
    label: "Triviell",
  },
  {
    value: 4,
    label: "Mindre alvorlig",
  },
  {
    value: 5,
    label: "Alvorlig",
  },
  {
    value: 6,
    label: "Kræsj",
  },
  {
    value: 7,
    label: "Blokkering",
  },
];

const Kategori = [
  {
    value: 0,
    label: "Ingen valgt",
  },
  {
    value: 1,
    label: "Triviell",
  },
  {
    value: 2,
    label: "Tekst",
  },
  {
    value: 3,
    label: "Justering",
  },
  {
    value: 4,
    label: "Mindre alvorlig",
  },
  {
    value: 5,
    label: "Alvorlig",
  },
  {
    value: 6,
    label: "Kræsj",
  },
  {
    value: 7,
    label: "Blokkering",
  },
];

const prioritet = [
  {
    value: 0,
    label: "Ingen valgt",
  },
  {
    value: 1,
    label: "Ingen",
  },
  {
    value: 2,
    label: "Lav",
  },
  {
    value: 3,
    label: "Normal",
  },
  {
    value: 4,
    label: "Høy",
  },
  {
    value: 5,
    label: "Haster",
  },
  {
    value: 6,
    label: "Øyeblikkelig",
  },
];

const reprodusere = [
  {
    value: 0,
    label: "Ingen valgt",
    color: "#F2CBD1",
  },
  {
    value: 2,
    label: "Alltid",
    color: "#F2CBD1",
  },
  {
    value: 3,
    label: "Noen ganger",
    color: "#F49CA9",
  },
  {
    value: 4,
    label: "Tilfeldig",
    color: "#F26A7E",
  },
  {
    value: 5,
    label: "Har ikke forsøkt",
    color: "#F20024",
  },
  {
    value: 6,
    label: "Kan ikke reprodusere",
    color: "#870D1F",
  },
  {
    value: 7,
    label: "Ingen",
    color: "#7B0C1D",
  },
];
const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    margin: "0 auto",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
  headerOne: {
    margin: "0 auto",
    padding: "0.5em",
    fontSize: "3em",
    color: "darkslategray",
  },
  active: {
    backgroundColor: "rgba(155, 205, 155, 0.12)",
  },
  container: {
    paddingTop: "20px",
    marginTop: "100px",
    marginBottom: "100px",
    paddingBottom: "50px",
    display: "grid",
    flexWrap: "wrap",
    borderRadius: "1em",
    backgroundColor: "white",
    boxShadow:
      "0 5px 15px -3px rgba(0, 0, 0, 0.1), 0 5px 15px -3px rgba(0, 0, 0, 0.05)",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    height: "80%",
    margin: "0 auto",
    [theme.breakpoints.up("xs")]: {
      maxWidth: "100%",
      width: "100%",
    },
  },

  input: {
    backgroundColor: theme.palette.background.paper,
    maxWidth: "100%",
    webkitTransition: "0.18s ease-out",
    mozTransition: "0.18s ease-out",
    oTransition: "0.18s ease-out",
    transition: "0.18s ease-out",
  },
  textField: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  BoxErrorField: {
    backgroundColor: "#ffe4e7",
    color: "red",
  },
  dense: {
    marginTop: theme.spacing(2),
  },
  menu: {
    width: 200,
  },
  button: {
    marginTop: "20px",
    height: "50px",
    margin: "0 auto",
    fontSize: 20,
    borderRadius: 15,
  },
  leftIcon: {
    marginRight: theme.spacing(1),
  },
  rightIcon: {
    marginLeft: theme.spacing(1),
  },
  iconSmall: {
    fontSize: "1.2em",
  },
  selected: {
    "&:hover": {
      backgroundColor: "green",
      color: "green",
    },
  },
}));

export default function CreateIssue(props) {
  const { match } = useReactRouter();
  const initialState = {
    setID: 0,
    setNavn: "",
    setDelegated: "",
    setKategori: "Ingen valgt",
    setAlvorlighetsgrad: "Ingen valgt",
    setPrioritet: "Ingen valgt",
    setReprodusere: "Ingen valgt",
    setOppsummering: "",
    setBeskrivelse: "",
    setStegReprodusere: "",
    setTillegg: "",
    setImageName: [""],
  };

  const classes = useStyles();
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState("");
  const [users, setUsers] = useState([]);
  const [userinfo, setUserinfo] = useState({
    user: [""],
    redirectToSignin: false,
  });
  const [open, setOpen] = React.useState(false);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const images = useSelector((state) => state);

  const init = (userId) => {
    const jwt = auth.isAuthenticated();

    findUserProfile(
      {
        userId,
      },
      { t: jwt.token }
    ).then((data) => {
      if (data.error) {
        setUserinfo({ redirectToSignin: true });
      } else {
        setUserinfo({ user: data });
        setValues({ setNavn: data.name });
      }
    });

    getUsers({ t: jwt.token }).then((data) => {
      if (data.error) {
        setValues({ redirectToSignin: true });
      } else {
        setUsers(data.data);
      }
    });
  };

  useEffect(() => {
    if (!users.length) {
      init(match.params.userId);
    }
  }, [!users.length]);

  const handleChange = (name) => (event) => {
    console.log(JSON.stringify(images))
    setValues({
      ...values,
      [name]: event.target.value,
    });
  };

  const errorAlert = (error) => (
    <Snackbar open={open} autohideduration={6000} onClose={handleClose}>
      <Alert onClose={handleClose} severity="error" variant="standard">
        <AlertTitle>Feil</AlertTitle>
        Noe gikk galt - {error}!
      </Alert>
    </Snackbar>
  );

  const onChangeImageDrop = (event) => {
    event.preventDefault();
    setValues((prevState) => ({
      ...prevState,
      setImageName: [...images.imageupload[1].name],
    }));
    console.log(images.imageupload[1]);

  };

  // Legg inn ny query / varelinje i database med backend API
  const putDataToDB = async () => {
    let imageNameValue = "[none]";
    if(images.length > 0)
    {
      imageNameValue = images.imageupload[1].name;
    }

    let data = {
      name: userinfo.user.name,
      category: values.setKategori,
      description: values.setBeskrivelse,
      reproduce: values.setReprodusere,
      severity: values.setAlvorlighetsgrad,
      priority: values.setPrioritet,
      summary: values.setOppsummering,
      delegated: values.setDelegated,
      step_reproduce: values.setStegReprodusere,
      additional_info: values.setTillegg,
      imageName: imageNameValue,
      // eslint-disable-next-line no-underscore-dangle
      userid: userinfo.user._id,
    }
    const jwt = auth.isAuthenticated()

    await issueService
      .addIssue({ data },
        jwt.token )
      .then((response) => {
        if (response.status === 200) {
          setOpen(true);
          clearState();
          setTimeout(function () {
            props.history.push("/saker/" + match.params.userId);
          }, 2000);
        }
      })
      .catch((err) => {
        setErrors(err.response.data);
        errorAlert(err.response.data);
        window.scrollTo(0, 0);
      });
    // clear errors on submit if any present, before correcting old error
  };

  const clearState = () => {
    setValues({ ...initialState });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setImages(prevState => ({...prevState, setImageName: [...images.imageupload[1].name]}));
    putDataToDB();
  };

  return (
    <div className={classes.root}>
      <Container>
        <form
          encType="multipart/form-data"
          className={classes.container}
          autoComplete="disabled"
          onSubmit={(e) => handleSubmit(e)}
        >
          <h3 className={classes.headerOne}>Skriv inn saksdetaljer</h3>
          <TextField
            id="outlined-select-delegert"
            select
            label="Deleger til"
            name="delegert"
            defaultValue="Ingen valgt"
            className={classes.textField}
            value={values.setDelegated || initialState.setDelegated}
            onChange={handleChange("setDelegated")}
            InputProps={{
              className: classes.input,
            }}
            SelectProps={{
              MenuProps: {
                className: classes.menu,
              },
            }}
            margin="normal"
            variant="outlined"
          >
            {users.map((option) => (
              <MenuItem key={option._id} value={option.name}>
                {option.name}
              </MenuItem>
            ))}
          </TextField>
          {errors.delegated ? (
            <Box
              className={classes.BoxErrorField}
              fontFamily="Monospace"
              color="error.main"
              p={1}
              m={1}
            >
              {errors.delegated} ⚠️
            </Box>
          ) : (
            ""
          )}
          <TextField
            id="outlined-select-alvorlighetsgrad"
            select
            label="Kategori"
            name="kategori"
            className={classes.textField}
            value={values.setKategori || "Ingen valgt"}
            onChange={handleChange("setKategori")}
            InputProps={{
              className: classes.input,
            }}
            SelectProps={{
              MenuProps: {
                className: classes.menu,
              },
            }}
            margin="normal"
            variant="outlined"
          >
            {Kategori.map((option) => (
              <MenuItem key={option.value} value={option.label}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          {errors.category ? (
            <Box
              className={classes.BoxErrorField}
              fontFamily="Monospace"
              color="error.main"
              p={1}
              m={1}
            >
              {errors.category} ⚠️
            </Box>
          ) : (
            ""
          )}
          <TextField
            id="outlined-select-alvorlighetsgrad"
            select
            name="alvorlighetsgrad"
            label="Alvorlighetsgrad"
            value={values.setAlvorlighetsgrad || "Ingen valgt"}
            className={classes.textField}
            onChange={handleChange("setAlvorlighetsgrad")}
            InputProps={{
              className: classes.input,
            }}
            SelectProps={{
              MenuProps: {
                className: classes.menu,
              },
            }}
            margin="normal"
            variant="outlined"
          >
            {alvorlighetsGrad.map((option) => (
              <MenuItem key={option.value} value={option.label}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          {errors.severity ? (
            <Box
              className={classes.BoxErrorField}
              fontFamily="Monospace"
              color="error.main"
              p={1}
              m={1}
            >
              {errors.severity} ⚠️
            </Box>
          ) : (
            ""
          )}
          <TextField
            id="outlined-select-prioritet"
            select
            name="prioritet"
            label="Prioritet"
            className={classes.textField}
            value={values.setPrioritet || "Ingen valgt"}
            onChange={handleChange("setPrioritet")}
            InputProps={{
              className: classes.input,
            }}
            SelectProps={{
              MenuProps: {
                className: classes.menu,
              },
            }}
            margin="normal"
            variant="outlined"
          >
            {prioritet.map((option) => (
              <MenuItem key={option.value} value={option.label}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          {errors.priority ? (
            <Box
              className={classes.BoxErrorField}
              fontFamily="Monospace"
              color="error.main"
              p={1}
              m={1}
            >
              {errors.priority} ⚠️
            </Box>
          ) : (
            ""
          )}
          <TextField
            id="outlined-select-prioritet"
            select
            name="reprodusere"
            label="Reprodusere"
            className={classes.textField}
            value={values.setReprodusere || "Ingen valgt"}
            onChange={handleChange("setReprodusere")}
            InputProps={{
              className: classes.input,
            }}
            SelectProps={{
              MenuProps: {
                className: classes.menu,
              },
            }}
            margin="normal"
            variant="outlined"
          >
            {reprodusere.map((option) => (
              <MenuItem
                key={option.value}
                value={option.label}
                selected
                style={{
                  backgroundColor: option.color,
                  color: "white",
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          {errors.reproduce ? (
            <Box
              className={classes.BoxErrorField}
              fontFamily="Monospace"
              color="error.main"
              p={1}
              m={1}
            >
              {errors.reproduce} ⚠️
            </Box>
          ) : (
            ""
          )}
          <TextField
            id="outlined-oppsummering"
            label="Oppsummering"
            name="oppsummering"
            value={[values.setOppsummering]}
            onChange={handleChange("setOppsummering")}
            className={classes.textField}
            InputProps={{
              className: classes.input,
            }}
            margin="normal"
            variant="outlined"
          />
          {errors.summary ? (
            <Box
              className={classes.BoxErrorField}
              fontFamily="Monospace"
              color="error.main"
              p={1}
              m={1}
            >
              {errors.summary} ⚠️
            </Box>
          ) : (
            ""
          )}
          <TextField
            id="outlined-beskrivelse-input"
            label="Beskrivelse"
            name="beskrivelse"
            value={[values.setBeskrivelse]}
            onChange={handleChange("setBeskrivelse")}
            className={classes.textField}
            InputProps={{
              className: classes.input,
            }}
            multiline
            rows="8"
            margin="normal"
            variant="outlined"
          />
          {errors.description ? (
            <Box
              className={classes.BoxErrorField}
              fontFamily="Monospace"
              color="error.main"
              p={1}
              m={1}
            >
              {errors.description} ⚠️
            </Box>
          ) : (
            ""
          )}
          <TextField
            id="outlined-reprodusere-input"
            label="Steg for å reprodusere	"
            className={classes.textField}
            value={values.setStegReprodusere}
            onChange={handleChange("setStegReprodusere")}
            InputProps={{
              className: classes.input,
            }}
            name="reprodusere"
            multiline
            rows="8"
            margin="normal"
            variant="outlined"
          />
          {errors.step_reproduce ? (
            <Box
              className={classes.BoxErrorField}
              fontFamily="Monospace"
              color="error.main"
              p={1}
              m={1}
            >
              {errors.step_reproduce} ⚠️
            </Box>
          ) : (
            ""
          )}
          <TextField
            id="outlined-multiline-static"
            label="Tilleggsinformasjon"
            name="tilleggsinformasjon"
            multiline
            rows="8"
            className={classes.textField}
            value={values.setTillegg}
            onChange={handleChange("setTillegg")}
            InputProps={{
              className: classes.input,
            }}
            margin="normal"
            variant="outlined"
          />
          {errors.additional_info ? (
            <Box
              className={classes.BoxErrorField}
              fontFamily="Monospace"
              color="error.main"
              p={1}
              m={1}
            >
              {errors.additional_info} ⚠️
            </Box>
          ) : (
            ""
          )}
          <Previews onChange={(e) => onChangeImageDrop(e)} />
          <Button
            type="submit"
            value="Submit"
            variant="contained"
            color="primary"
            className={classes.button}
          >
            Send inn sak
            <Icon className={classes.rightIcon}>send</Icon>
          </Button>
          <Snackbar open={open} autohideduration={3000} onClose={handleClose}>
            <Alert onClose={handleClose} severity="success" variant="standard">
              <AlertTitle>Suksess</AlertTitle>
              Sak ble opprettet!
            </Alert>
          </Snackbar>
        </form>
      </Container>
    </div>
  );
}
