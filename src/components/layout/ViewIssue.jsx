/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import issueService from "../../services/issueService";
import "../../App.css";
import CommentForm from "../Comments/CommentForm";
import Comments from "../Comments/Comments";
import moment from "moment";
import CssBaseline from "@material-ui/core/CssBaseline";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Divider from "@material-ui/core/Divider";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import InputLabel from "@material-ui/core/InputLabel";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import SaveIcon from "@material-ui/icons/Save";
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
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Paper from '@material-ui/core/Paper';

const drawerWidth = 240;

const formattedDate = (value) => moment(value).format("DD/MM-YYYY");

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  paper: {
    width: '100%',
    flexShrink: 0,
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
    borderRadius: ".1em",
    padding: theme.spacing(2),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: "100%",
  },
  textFieldStatus: {
    margin: theme.spacing(1),
    width: "10%",
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

export default function ViewIssue(props) {
  const classes = useStyles();
  const [dataset, setData] = useState([""]);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState("");
  const [myself, setMyself] = useState([]);
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);

  const [selectedDate, setSelectedDate] = useState(dataset.updatedAt);
  const history = useHistory();

  const goHome = () => {
    history.push("/saker/" + auth.isAuthenticated().user._id);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirmDelete = () => {
    onDelete();
  };

  const handleChange = (event) => {
    setData(event.target.value);
  };

  const handleDataChange = (name) => (event) => {
    setData({
      ...dataset,
      [name]: event.target.value,
    });
    upDateIssueStatus(id, event.target.value, myself.role);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const { id } = props.match.params;

  useEffect(() => {
    const jwt = auth.isAuthenticated()
    getIssueByID(id, jwt.token);
    getComments();
  }, [id]);

  const getIssueByID = async (id, token) => {
    console.log(token)
    const res = await issueService.getIssueByID(id, token);
    setData(res);
    console.log("Imagename: ", res.imageName)
    if (res.imageName === "" || res.imageName === "[none]" || res.imageName === "none" || res.imageName === undefined) {
      setImages(["none"]);
    } else {
      setImages(res.imageName); //[0]
    }
  };

  const getComments = async () => {
    const jwt = auth.isAuthenticated()
    const res = await issueService.getComments(jwt.token);
    let commentList = res.slice(0, 10);
    setComments(commentList);
  };


  const upDateIssueStatus = async (id, data) => {
    const jwt = auth.isAuthenticated()

    console.log("Status: " + id);
    await issueService
      .upDateIssueStatus(id, { status: data }, jwt.token)
      .then((response) => {
        setData({ ...dataset, status: data });
      })
      .catch((e) => {
        console.log("ISSUE UPDATE: ", e);
      });
  };

  const onDelete = async () => {
    const jwt = auth.isAuthenticated()

    console.log("Inside OnDelete", dataset._id + " " + jwt.token);
    const id = dataset._id;
    await issueService
      .deleteIssueByID(id, jwt.token)
      .then((response) => {
        console.log("ISSUE DELETED SUCCESSFULLY", response.status);
        setOpen(false);
        goHome();
      })
      .catch((e) => {
        console.log("DELETING ISSUE FAILED WITH ERROR: ", e);
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

  useEffect(
    () => {
      // Make sure to revoke the data uris to avoid memory leaks
      images.forEach((file) => URL.revokeObjectURL(file.path));
    },
    [images] // files
  );

  const imgList = images.map((file, index) => {
    console.log("File" , file);

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

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Slett sak"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Er du helt sikker på at du vil slette sak ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="default">
            Avbryt
          </Button>
          <Button onClick={handleConfirmDelete} color="primary" autoFocus>
            Slett sak
          </Button>
        </DialogActions>
      </Dialog>
      <nav className={classes.drawer} aria-label="Mailbox folders" />
      <Paper elevation={0} className={classes.paper}>
      <main className={classes.content}>
      <br/>
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
              component={Link}
              startIcon={<EditIcon />}
              to={"/edit-issue/" + dataset._id}
              size="large"
              disabled={auth.isAuthenticated().user._id != dataset.userid}
            >
              Rediger
            </Button>
            <Button
              variant="contained"
              color="secondary"
              className={classes.button}
              startIcon={<DeleteIcon />}
              size="large"
              onClick={handleClickOpen}
            >
              Slett sak
            </Button>
            <TextField
              id="outlined-select-status"
              select
              label="Status"
              name="Status"
              size="small"
              className={classes.textFieldStatus}
              value={[dataset.status ? dataset.status : "Åpen"]}
              InputProps={{
                className: classes.input,
              }}
              SelectProps={{
                MenuProps: {
                  className: classes.menu,
                },
              }}
              margin="normal"
              inputProps={{ "aria-label": "naked" }}
              onChange={e => upDateIssueStatus(dataset._id, e.target.value)}
            >
              {Status.map((option, key) => (
                <MenuItem key={key} value={option.label}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            {errors.status ? (
              <Box
                className={classes.BoxErrorField}
                fontFamily="Monospace"
                color="error.main"
                p={1}
                m={1}
              >
                {errors.status} ⚠️
              </Box>
            ) : (
              ""
            )}
          </div>
          <div className="item2">
            <TextField
              label="Priority"
              value={[dataset.priority ? dataset.priority : ""]}
              className={classes.textField}
              margin="normal"
              variant="standard"
              InputProps={{
                readOnly: true,
              }}
            />
          </div>
          <div className="item3">
            <TextField
              label="Sist oppdatert"
              value={formattedDate(dataset.updatedAt)}
              className={classes.textField}
              margin="normal"
              variant="standard"
              InputProps={{
                readOnly: true,
              }}
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
              label="Kategori"
              value={[dataset.category ? dataset.category : ""]}
              className={classes.textField}
              margin="normal"
              variant="standard"
              InputProps={{
                readOnly: true,
              }}
            />
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
              label="Alvorlighetsgrad"
              value={[dataset.severity ? dataset.severity : ""]}
              className={classes.textField}
              margin="normal"
              variant="standard"
              InputProps={{
                readOnly: true,
              }}
            />
          </div>
          <div className="item8">
            <TextField
              label="Mulighet å reprodusere"
              value={[dataset.reproduce ? dataset.reproduce : ""]}
              className={classes.textField}
              margin="normal"
              variant="standard"
              InputProps={{
                readOnly: true,
              }}
            />
          </div>
          <div className="item15">
            <TextField
              label="Delegert til"
              value={[dataset.delegated ? dataset.delegated : "Ingen"]}
              className={classes.textField}
              margin="normal"
              variant="standard"
              InputProps={{
                readOnly: true,
              }}
            />
          </div>
          <div className="item11">
            <TextField
              multiline
              label="Oppsummering"
              value={[dataset.summary ? dataset.summary : ""]}
              className={classes.textField}
              margin="normal"
              variant="standard"
              InputProps={{
                readOnly: true,
              }}
            />
          </div>
          <div className="item12">
            <TextField
              multiline
              rowsMax="8"
              variant="standard"
              label="Beskrivelse"
              value={[dataset.description ? dataset.description : ""]}
              className={classes.textField}
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
          </div>
          <div className="item13">
            <TextField
              multiline
              variant="standard"
              rows="10"
              label="Steg for å reprodusere"
              value={[dataset.step_reproduce ? dataset.step_reproduce : ""]}
              className={classes.textField}
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
          </div>
          <div className="item10">
            <TextField
              multiline
              rows="10"
              variant="standard"
              label="Tilleggsinformasjon"
              value={[dataset.additional_info ? dataset.additional_info : ""]}
              className={classes.textField}
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
          </div>
          <div className="item16">
          <Typography variant="h4" p={5}  paragraph>Kommentarfelt<Divider/></Typography>
            <Comments comments={comments} />
          </div>
          <div className="item17">

            <CommentForm/>
          </div>
        </div>

      </main>
      </Paper>
    </div>
  );
}
