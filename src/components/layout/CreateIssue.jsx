/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from "react";
import useReactRouter from "use-react-router";
import {
  makeStyles,
  createTheme,
  ThemeProvider,
  withStyles,
} from "@material-ui/core/styles";
import issueService from "../../services/issueService";
import Icon from "@material-ui/core/Icon";
// eslint-disable-neAlertxt-line no-unused-vars
import {
  EditorState,
  //convertFromRaw,
  convertToRaw,
  ContentState,
} from "draft-js";
import {
  Typography,
  Snackbar,
  TextField,
  Container,
  Grid,
  Button,
  CssBaseline,
} from "@material-ui/core";
import MuiMenuItem from "@material-ui/core/MenuItem";
import { Editor } from "react-draft-wysiwyg";
//import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
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

const MenuItem = withStyles({
  root: {
    display: "table",
    width: "100%",
    justifyContent: "flex-end",
  },
})(MuiMenuItem);

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
    boxShadow:
      "0 5px 15px -3px rgba(0, 0, 0, 0.1), 0 5px 15px -3px rgba(0, 0, 0, 0.05)",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    height: "80%",
    margin: "0 auto",
    backdropFilter: "blur(6px) saturate(180%)",
    webkitBackdropFilter: "blur(6px) saturate(180%)",
    backgroundColor: "rgba(255, 255, 255, 0.55)",
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
    width: "90%",
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

const theme = createTheme({
  typography: {
    body1: {
      fontWeight: 600,
      padding: "0.3rem",
    },
  },
});

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
    setImageName: [""],
  };

  const contentBlock = htmlToDraft("");
  const initState = contentBlock ?
    EditorState.createWithContent(
        ContentState.createFromBlockArray(contentBlock.contentBlocks)
      )
    : EditorState.createEmpty();

  const [editorStateDesc, setEditorStateDesc] = useState(initState);
  const [editorStateRep, setEditorStateRep] = useState(initState);

  const classes = useStyles();
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState("");
  const [users, setUsers] = useState([]);
  const [userinfo, setUserinfo] = useState({
    user: [""],
    redirectToSignin: false,
  });
  const [open, setOpen] = useState(false);

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
      init(match.params.id);
    }
  }, [match.params.id, users.length]);

  const handleChange = (name) => (event) => {
    console.log(JSON.stringify(images));
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
      setImageName: [...images.imageupload],
    }));
    console.log("IMAGE UPLOAD FILE >>>", images.imageupload);
  };

  // Legg inn ny sak
  const createIssue = async () => {

    let imageNameValue = images.imageupload;
    console.log("Create issue IMAGE: ", imageNameValue);

    const htmlContentStateDesc = JSON.stringify(
      convertToRaw(editorStateDesc.getCurrentContent())
    );
    values.setBeskrivelse = htmlContentStateDesc;

    const htmlContentStateRep = JSON.stringify(
      convertToRaw(editorStateRep.getCurrentContent())
    );
    values.setStegReprodusere = htmlContentStateRep;

    let data = {
      name: userinfo.user.name,
      reporter_id: userinfo.user._id,
      category: values.setKategori,
      description: values.setBeskrivelse,
      reproduce: values.setReprodusere,
      severity: values.setAlvorlighetsgrad,
      priority: values.setPrioritet,
      summary: values.setOppsummering,
      delegated: values.setDelegated,
      step_reproduce: values.setStegReprodusere,
      imageName: imageNameValue,
      // eslint-disable-next-line no-underscore-dangle
      userid: userinfo.user._id,
    };
    const jwt = auth.isAuthenticated();

    await issueService
      .addIssue({ data }, jwt.token)
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
    createIssue();
  };

  const onEditorStateChangeDesc = (editorState) => {
    setEditorStateDesc(editorState);
  };

  const onEditorStateChangeRep = (editorState) => {
    setEditorStateRep(editorState);
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
          <Box textAlign="center">
            <Typography variant="body2">
              Alle felt merket med en stjerne (*) er obligatoriske
            </Typography>
          </Box>
          <Grid
            container
            alignItems="flex-start"
            spacing={2}
            style={{ padding: "1rem" }}
          >
            <CssBaseline />
            <Grid item xs={6}>
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
                  <MenuItem key={option._id} value={option._id}>
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
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="outlined-select-alvorlighetsgrad"
                select
                label="Kategori *"
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
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="outlined-select-alvorlighetsgrad"
                select
                name="alvorlighetsgrad"
                label="Alvorlighetsgrad *"
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
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="outlined-select-prioritet"
                select
                name="prioritet"
                label="Prioritet *"
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
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="outlined-select-prioritet"
                select
                name="reprodusere"
                label="Reprodusere *"
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
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="outlined-oppsummering"
                label="Oppsummering *"
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
            </Grid>
            <Grid item xs={12} style={{ padding: "1rem" }}>
              <ThemeProvider theme={theme}>
                <Typography variant="body1">Beskrivelse *</Typography>
              </ThemeProvider>
              <Editor
                placeholder="Skriv inn tekst her..."
                editorState={editorStateDesc}
                editorStyle={{
                  backgroundColor: "white",
                  border: "1px solid lightgray",
                  borderTop: "0px solid lightgray",
                  minHeight: "100%",
                  height: "350px",
                  padding: 10,
                  borderRadius: "0 0 0.5rem 0.5rem",
                }}
                toolbarStyle={{
                  borderRadius: "0.5rem 0.5rem 0 0",
                  marginBottom: "1px",
                }}
                wrapperClassName="wrapper"
                toolbarClassName="toolbar"
                editorClassName="editor"
                onEditorStateChange={onEditorStateChangeDesc}
                toolbar={{
                  link: { inDropdown: true },
                  list: { inDropdown: true },
                  options: [
                    "fontFamily",
                    "inline",
                    "blockType",
                    "fontSize",
                    "list",
                    "image",
                    "textAlign",
                    "colorPicker",
                    "link",
                    "embedded",
                    "emoji",
                    "remove",
                    "history",
                  ],
                  inline: {
                    options: [
                      "bold",
                      "italic",
                      "underline",
                      "strikethrough",
                      "monospace",
                    ],
                  },
                }}
                hashtag={{
                  separator: " ",
                  trigger: "#",
                }}
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
            </Grid>
            <Grid item xs={12} style={{ padding: "1rem" }}>
              <ThemeProvider theme={theme}>
                <Typography variant="body1">Steg for å reprodusere</Typography>
              </ThemeProvider>
              <Editor
                placeholder="Skriv inn tekst her..."
                editorState={editorStateRep}
                editorStyle={{
                  backgroundColor: "white",
                  border: "1px solid lightgray",
                  borderTop: "0px solid lightgray",
                  minHeight: "100%",
                  height: "350px",
                  padding: 10,
                  borderRadius: "0 0 0.5rem 0.5rem",
                }}
                toolbarStyle={{
                  borderRadius: "0.5rem 0.5rem 0 0",
                  marginBottom: "1px",
                }}
                wrapperClassName="wrapper"
                toolbarClassName="toolbar"
                editorClassName="editor"
                onEditorStateChange={onEditorStateChangeRep}
                toolbar={{
                  link: { inDropdown: true },
                  list: { inDropdown: true },
                  options: [
                    "fontFamily",
                    "inline",
                    "blockType",
                    "fontSize",
                    "list",
                    "image",
                    "textAlign",
                    "colorPicker",
                    "link",
                    "embedded",
                    "emoji",
                    "remove",
                    "history",
                  ],
                  inline: {
                    options: [
                      "bold",
                      "italic",
                      "underline",
                      "strikethrough",
                      "monospace",
                    ],
                  },
                }}
                hashtag={{
                  separator: " ",
                  trigger: "#",
                }}
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
            </Grid>
            <Grid item xs={12}>
              <Previews imageBool={false} onChange={(e) => onChangeImageDrop(e)} />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                value="Submit"
                variant="contained"
                color="primary"
                className={classes.button}
                style={{
                  margin: "0 auto",
                  display: "flex",
                  padding: "1rem",
                  borderRadius: "1em",
                }}
              >
                Send inn sak
                <Icon className={classes.rightIcon}>send</Icon>
              </Button>
            </Grid>
            <Snackbar open={open} autohideduration={3000} onClose={handleClose}>
              <Alert
                onClose={handleClose}
                severity="success"
                variant="standard"
              >
                <AlertTitle>Suksess</AlertTitle>
                Sak ble opprettet!
              </Alert>
            </Snackbar>
          </Grid>
        </form>
      </Container>
    </div>
  );
}
