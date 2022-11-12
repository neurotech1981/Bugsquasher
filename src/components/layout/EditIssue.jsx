/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  makeStyles,
  createTheme,
  ThemeProvider,
} from "@material-ui/core/styles";
import issueService from "../../services/issueService";
import "../../App.css";
import moment from "moment";
import CssBaseline from "@material-ui/core/CssBaseline";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import InputLabel from "@material-ui/core/InputLabel";
import IconButton from "@material-ui/core/IconButton";
import SaveIcon from "@material-ui/icons/Save";
import CancelIcon from "@material-ui/icons/Cancel";
import MuiAlert from "@material-ui/lab/Alert";
import Avatar from "@material-ui/core/Avatar";
import MenuItem from "@material-ui/core/MenuItem";
import ModalImage from "react-modal-image";
import { deepPurple } from "@material-ui/core/colors";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import {
  EditorState,
  convertFromRaw,
  convertToRaw,
  ContentState,
} from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";

import "../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { useHistory } from "react-router-dom";
import auth from "../auth/auth-helper";
import { getUsers } from "../utils/api-user";
import Snackbar from "@material-ui/core/Snackbar";
import { AlertTitle } from "@material-ui/lab";

function Alert(props) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <MuiAlert elevation={1} variant="filled" {...props} />;
}

const errorAlert = (error) => (
  <Snackbar autoHideDuration={6000} onClose={handleClose}>
    <Alert onClose={handleClose} severity="error" variant="standard">
      <AlertTitle>Feil</AlertTitle>
      Noe gikk galt - {error}!
    </Alert>
  </Snackbar>
);

const drawerWidth = 240;
const formattedDate = (value) => moment(value).format("DD/MM-YYYY");

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

const theme = createTheme({
  typography: {
    body1: {
      fontWeight: 600, // or 'bold'
    },
  },
});

const useStyles = makeStyles((theme) => ({
  root: {
    display: "grid",
  },
  button: {
    margin: theme.spacing(1),
  },
  typography: {
    body1: {
      fontWeight: 600, // or 'bold'
    },
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    paddingTop: "50px",
  },
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: "100%",
    backgroundColor: "white",
  },
  textFieldStatus: {
    margin: theme.spacing(1),
    width: "10%",
    backgroundColor: "white",
    marginTop: "0",
  },
  avatar: {
    margin: 10,
  },
  purpleAvatar: {
    margin: 0,
    left: 0,
    width: "70px",
    height: "70px",
    color: "#fff",
    backgroundColor: deepPurple[500],
  },
}));

const thumbsContainer = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 16,
  textAlign: "left",
};

const thumb = {
  display: "inline-flex",
  position: "relative",
  borderRadius: 2,
  border: "3px solid #eaeaea",
  marginBottom: 8,
  marginRight: 4,
  width: 150,
  height: 150,
  padding: 4,
  boxSizing: "border-box",
  margin: "0 auto",
};

const thumbInner = {
  display: "flex",
  minWidth: 0,
  overflow: "hidden",
};

const img = {
  display: "block",
  width: "auto",
  height: "100%",
};

export default function EditIssue(props) {
  const { id } = useParams();

  const [open, setOpen] = useState(false);
  const classes = useStyles();
  const [dataset, setData] = useState([""]);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState("");
  const [myself, setMyself] = useState([]);
  const [users, setUsers] = useState([]);

  const contentBlock = htmlToDraft("<h1>Hello world</h1>");
  const initState = contentBlock ?
    EditorState.createWithContent(
        ContentState.createFromBlockArray(contentBlock.contentBlocks)
      )
    : EditorState.createEmpty();

  const [editorStateDesc, setEditorStateDesc] = useState(initState);
  const [editorStateRep, setEditorStateRep] = useState(initState);

  const [selectedDate, setSelectedDate] = useState(dataset.updatedAt);
  const history = useHistory();

  const goHome = () => {
    history.push("/saker/" + auth.isAuthenticated().user._id);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const handleChange = (event) => {
    setData(event.target.value);
  };

  const init = () => {
    const jwt = auth.isAuthenticated();

    getUsers({ t: jwt.token }).then((data) => {
      if (data.error) {
        setValues({ redirectToSignin: true });
      } else {
        console.log("Inside init >> ", data);
        setUsers(data.data);
      }
    });
  };

  const handleDataChange = (name) => (event) => {
    console.log("Updated ", name, event);
    setData({
      ...dataset,
      [name]: event.target.value,
    });
  };

  useEffect(() => {
    const jwt = auth.isAuthenticated();

    getIssueByID(id, jwt.token);
    if (!users.length) {
      init(id);
    }
  }, [id, users.length]);

  const getIssueByID = async (id, token) => {
    console.log(token);
    const res = await issueService.getIssueByID(id, token);

    let editorStateDesc = EditorState.createWithContent(
      convertFromRaw(JSON.parse(res.description))
    );

    setEditorStateDesc(editorStateDesc);

    let editorStateRep = EditorState.createWithContent(
      convertFromRaw(JSON.parse(res.step_reproduce))
    );

    setEditorStateRep(editorStateRep);

    setData(res);
    console.log("Result Dataset: >>>>" , res)
    console.log("Imagename: ", res.imageName);
    if (
      res.imageName === "" ||
      res.imageName === "[none]" ||
      res.imageName === "none" ||
      res.imageName === undefined
    ) {
      setImages(["none"]);
    } else {
      setImages(res.imageName); //[0]
    }
  };

  const updateIssueByID = async () => {
    const jwt = auth.isAuthenticated();
    const id = dataset._id;

    const htmlContentStateDesc = JSON.stringify(
      convertToRaw(editorStateDesc.getCurrentContent())
    );
    dataset.description = htmlContentStateDesc;

    const htmlContentStateRep = JSON.stringify(
      convertToRaw(editorStateRep.getCurrentContent())
    );
    dataset.step_reproduce = htmlContentStateRep;

    await issueService
      .upDateIssue(id, { dataset }, jwt.token)
      .then((response) => {
        setOpen(true);

        setTimeout(() => {
          history.push("/vis-sak/" + id);
        }, 1000);

        const { data } = response.data;
        data.description = htmlContentStateDesc;
        data.step_reproduce = htmlContentStateRep;
        setData({ ...dataset, data });
      })
      .catch((e) => {
        console.log("ISSUE UPDATE: ", e);
      });
  };

  const onDelete = async () => {
    const id = dataset._id;
    await issueService
      .deleteIssueByID(id)
      .then((response) => {
        goHome();
      })
      .catch((e) => {
        console.log("Error deleting: ", e);
      });
  };

  const Status = [
    {
      value: 0,
      label: "Åpen",
    },
    {
      value: 1,
      label: "Løst",
    },
    {
      value: 2,
      label: "Lukket",
    },
    {
      value: 3,
      label: "Under arbeid",
    },
  ];

  const CancelEdit = () => {
    history.goBack();
  };

  useEffect(
    () => {
      // Make sure to revoke the data uris to avoid memory leaks
      images.forEach((file) => URL.revokeObjectURL(file.path));
    },
    [images] // files
  );

  const imgList = images.map((file, index) => {
    console.log("File", file);

    if (file === "none" || file === undefined) {
      return <div key={index}>Ingen vedlegg</div>;
    }
    return (
      <div style={{ display: "grid", margin: "1em" }} key={index}>
        <ModalImage
          small={process.env.PUBLIC_URL + "/uploads/" + file.path}
          large={process.env.PUBLIC_URL + "/uploads/" + file.path}
          alt={file.path}
          imageBackgroundColor="transparent"
        />
      </div>
    );
  });

  const onEditorStateChangeDesc = (editorState) => {
    setEditorStateDesc(editorState);
  };

  const onEditorStateChangeRep = (editorState) => {
    setEditorStateRep(editorState);
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <nav className={classes.drawer} aria-label="Drawe" />
      <div className="grid-container two-columns__center">
        <section className="two-columns__main">
          <div className="form-grid">
            <div className="item0">
              <IconButton onClick={goHome}>
                <ArrowBackIcon />
              </IconButton>
            </div>
            <div className="item1" style={{ paddingLeft: "5rem" }}>
              {dataset.name}
              <p style={{ fontSize: "0.6em", marginTop: "0.3em" }}>
                Opprettet: {formattedDate(dataset.createdAt)}
              </p>
              <Button
                variant="outlined"
                color="primary"
                className={classes.button}
                startIcon={<SaveIcon />}
                size="small"
                onClick={() => updateIssueByID()}
              >
                Lagre endringer
              </Button>
              <Button
                variant="outlined"
                color="default"
                className={classes.button}
                startIcon={<CancelIcon />}
                size="small"
                onClick={() => CancelEdit()}
              >
                Avbryt
              </Button>
            </div>
            <div className="item2">
              <TextField
                id="outlined-select-prioritet"
                select
                name="prioritet"
                label="Prioritet"
                className={classes.textField}
                value={dataset.priority || "Ingen valgt"}
                onChange={handleDataChange("priority")}
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
            </div>
            <div className="item3">
              <TextField
                label="Sist oppdatert"
                value={formattedDate(dataset.updatedAt)}
                className={classes.textField}
                margin="normal"
                variant="outlined"
                onChange={handleChange}
              />
            </div>
            <div className="item14">
              <InputLabel shrink htmlFor="select-multiple-native">
                Vedlegg
              </InputLabel>
              <aside style={thumbsContainer}>{imgList}</aside>
            </div>
            <div className="item4">
              <TextField
                id="outlined-select-alvorlighetsgrad"
                select
                label="Kategori"
                name="category"
                className={classes.textField}
                value={dataset.category || "Ingen valgt"}
                onChange={(e) =>
                  setData({
                    ...dataset,
                    [e.target.name]: e.target.value,
                  })
                }
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
            </div>
            <div className="item1">
              <Grid container alignItems="flex-start">
                <Avatar
                  alt="Profile picture"
                  className={classes.purpleAvatar}
                ></Avatar>
              </Grid>
            </div>
            <div className="item7">
              <TextField
                id="outlined-select-alvorlighetsgrad"
                select
                name="alvorlighetsgrad"
                label="Alvorlighetsgrad"
                value={dataset.severity || "Ingen valgt"}
                className={classes.textField}
                onChange={handleDataChange("severity")}
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
            </div>
            <div className="item8">
              <TextField
                id="outlined-select-prioritet"
                select
                name="reprodusere"
                label="Reprodusere"
                className={classes.textField}
                value={dataset.reproduce || "Ingen valgt"}
                onChange={handleDataChange("reproduce")}
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
            </div>
            <div className="item15">
              <TextField
                id="outlined-select-delegert"
                select
                label="Delegert til"
                name="delegated"
                className={classes.textField}
                value={[
                  dataset.delegated != null ?
                    dataset.delegated.id
                    : "Laster...",
                ]}
                onChange={handleDataChange("delegated")}
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
            </div>
            <div className="item12">
              <TextField
                multiline
                label="Oppsummering"
                onChange={handleDataChange("summary")}
                value={[dataset.summary ? dataset.summary : ""]}
                className={classes.textField}
                margin="normal"
                variant="outlined"
              />
            </div>
            <div className="item11">
              <ThemeProvider theme={theme}>
                <Typography variant="body1">Beskrivelse</Typography>
              </ThemeProvider>
              <Editor
                placeholder="Skriv inn tekst her..."
                editorState={editorStateDesc}
                editorStyle={{
                  backgroundColor: "white",
                  border: "1px solid lightgray",
                  borderTop: "0px solid lightgray",
                  minHeight: "100%",
                  padding: 10,
                  borderRadius: "0 0 0.5rem 0.5rem",
                }}
                toolbarStyle={{
                  borderRadius: "0.5rem 0.5rem 0 0",
                  marginBottom: "1px",
                }}
                wrapperClassName="demo-wrapper"
                toolbarClassName="flex sticky top-0 z-20 !justify-start"
                editorClassName="mt-5 shadow-sm border min-h-editor p-2"
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
            </div>
            <div className="item13">
              <ThemeProvider theme={theme}>
                <Typography variant="body1">
                  Steg for å reprodusere
                </Typography>
              </ThemeProvider>
              <Editor
                placeholder="Skriv inn tekst her..."
                editorState={editorStateRep}
                editorStyle={{
                  backgroundColor: "white",
                  border: "1px solid lightgray",
                  borderTop: "0px solid lightgray",
                  minHeight: "100%",
                  padding: 10,
                  borderRadius: "0 0 0.5rem 0.5rem",
                }}
                toolbarStyle={{
                  borderRadius: "0.5rem 0.5rem 0 0",
                  marginBottom: "1px",
                }}
                wrapperClassName="demo-wrapper"
                toolbarClassName="flex sticky top-0 z-20 !justify-start"
                editorClassName="mt-5 shadow-sm border min-h-editor p-2"
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
            </div>
            <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
              <Alert
                onClose={handleClose}
                severity="success"
                variant="standard"
              >
                <AlertTitle>Suksess</AlertTitle>
                Sak ble oppdatert!
              </Alert>
            </Snackbar>
          </div>
        </section>
      </div>
    </div>
  );
}
