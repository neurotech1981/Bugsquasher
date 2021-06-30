/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import useReactRouter from "use-react-router";
import { makeStyles } from "@material-ui/core/styles";
import issueService from "../../services/issueService";
import "../../App.css";
import moment from "moment";
import CssBaseline from "@material-ui/core/CssBaseline";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import DeleteForeverRoundedIcon from "@material-ui/icons/DeleteForeverRounded";
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
import { Link } from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";
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
  <Snackbar open={open} autohideduration={6000} onClose={handleClose}>
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

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  button: {
    margin: theme.spacing(1),
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
  const { match } = useReactRouter();

  const [open, setOpen] = React.useState(false);
  const classes = useStyles();
  const [dataset, setData] = useState([""]);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState("");
  const [myself, setMyself] = useState([]);
  const [users, setUsers] = useState([]);

  const [selectedDate, setSelectedDate] = React.useState(dataset.updatedAt);
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

  const { id } = props.match.params;

  const init = (userId) => {
    const jwt = auth.isAuthenticated();

    getUsers({ t: jwt.token }).then((data) => {
      if (data.error) {
        setValues({ redirectToSignin: true });
      } else {
        setUsers(data.data);
      }
    });
  };

  const handleDataChange = (name) => (event) => {
    setData({
      ...dataset,
      [name]: event.target.value,
    });
    //
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  useEffect(() => {
    const jwt = auth.isAuthenticated()

    getIssueByID(id, jwt.token);
    if (!users.length) {
      init(match.params.userId);
    }
  }, [id]);

  const getIssueByID = async (id) => {
    const jwt = auth.isAuthenticated()
    const res = await issueService.getIssueByID(id,
      jwt.token);
    setData(res);
    console.log(res.imageName);
    if (res.imageName === "" || res.imageName === "[none]" ) {
      setImages(["none"]);
    } else {
      setImages(res.imageName); //[0]
    }
  };

  const updateIssueByID = async () => {
    const jwt = auth.isAuthenticated()
    const id = dataset._id;

    await issueService
      .upDateIssue(id, { dataset },
        { t: jwt.token })
      .then((response) => {
        console.log("UPDATED", response);
        setOpen(true);

        setTimeout(() => {
          history.push("/vis-sak/" + id);
        }, 1000);

        const { data } = response.data;
        setData({ ...dataset, data });
      })
      .catch((e) => {
        console.log("ISSUE UPDATE: ", e);
      });
  };

  const onDelete = async () => {
    console.log("ID DELETE", dataset._id);
    const id = dataset._id;
    await issueService
      .deleteIssueByID(id)
      .then((response) => {
        console.log("ISSUE DELETED SUCCESSFULLY");
        goHome();
      })
      .catch((e) => {
        console.log("ISSUE UPDATE: ", e);
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

  const thumbs = images.map((file, index) => (
    <div style={thumb} key={index}>
      <div style={thumbInner}>
        <DeleteForeverRoundedIcon className={classes.icon} />
        <img alt={file.name} src={file.path} style={img} />
      </div>
    </div>
  ));

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
    if (file === "none") {
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

  return (
    <div className={classes.root}>
      <CssBaseline />
      <nav className={classes.drawer} aria-label="Mailbox folders" />
      <main className={classes.content}>
        <Typography variant="h4" gutterBottom></Typography>
        <div className="grid-container">
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
              variant="contained"
              color="primary"
              className={classes.button}
              startIcon={<SaveIcon />}
              size="small"
              onClick={() => updateIssueByID()}
            >
              Lagre endringer
            </Button>
            <Button
              variant="contained"
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
              name="kategori"
              className={classes.textField}
              value={dataset.category || "Ingen valgt"}
              onChange={handleDataChange("category")}
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
              name="delegert"
              defaultValue="Ingen valgt"
              className={classes.textField}
              value={dataset.delegated || "Ingen valgt"}
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
          </div>
          <div className="item11">
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
          <div className="item12">
            <TextField
              multiline
              rowsMax="8"
              variant="outlined"
              label="Beskrivelse"
              onChange={handleDataChange("description")}
              value={[dataset.description ? dataset.description : ""]}
              className={classes.textField}
              margin="normal"
            />
          </div>
          <div className="item13">
            <TextField
              multiline
              variant="outlined"
              onChange={handleDataChange("step_reproduce")}
              rows="10"
              label="Steg for å reprodusere"
              value={[dataset.step_reproduce ? dataset.step_reproduce : ""]}
              className={classes.textField}
              margin="normal"
            />
          </div>
          <div className="item10">
            <TextField
              multiline
              rows="10"
              onChange={handleDataChange("additional_info")}
              variant="outlined"
              label="Tilleggsinformasjon"
              value={[dataset.additional_info ? dataset.additional_info : ""]}
              className={classes.textField}
              margin="normal"
            />
          </div>
          <Snackbar open={open} autohideduration={3000} onClose={handleClose}>
            <Alert onClose={handleClose} severity="success" variant="standard">
              <AlertTitle>Suksess</AlertTitle>
              Sak ble oppdatert!
            </Alert>
          </Snackbar>
        </div>
      </main>
    </div>
  );
}
