/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import useReactRouter from "use-react-router";
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
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import InputLabel from "@material-ui/core/InputLabel";
import IconButton from "@material-ui/core/IconButton";
import FormControl from "@material-ui/core/FormControl";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import { AlertTitle } from "@material-ui/lab";
import DeleteIcon from "@material-ui/icons/Delete";
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
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { findUserProfile, getUsers } from "../utils/api-user";

const drawerWidth = 240;

function Alert(props) {
  return <MuiAlert elevation={1} variant="filled" {...props} />;
}
const formattedDate = (value) => moment(value).format("DD/MM-YYYY");

const useStyles = makeStyles((theme) => ({
  root: {
    display: "grid",
  },
  paper: {
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
    padding: theme.spacing(2),
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
  },
  textFieldStatus: {
    margin: theme.spacing(1),
    width: "100%",
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
  formControl: {
    margin: theme.spacing(1),
  },
  flexContainer: {
    display: "grid",
    posistion: "absolute",
    flexDirection: "row",
    width: "50vh",
    height: "50%",
    padding: "1rem",
    backgroundColor: "azure",
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
  const { match } = useReactRouter();

  const classes = useStyles();
  const [dataset, setData] = useState([""]);
  const [images, setImages] = useState([]);
  const [openStatusUpdate, setOpenStatusUpdate] = useState({
    openStatusSnackbar: false,
    verticalStatusUpdate: "bottom",
    horizontalStatusUpdate: "left",
  });
  const [userinfo, setUserinfo] = useState({
    user: [""],
    redirectToSignin: false,
  });
  const [errors, setErrors] = useState("");
  const [myself, setMyself] = useState([]);
  const [open, setOpen] = useState(false);
  const [opennewcomment, setOpenNewComment] = useState(false);
  const [comments, setComments] = useState([]);

  const [selectedDate, setSelectedDate] = useState(dataset.updatedAt);
  const history = useHistory();

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
      }
    });
  };

  useEffect(() => {
      init(match.params.userId);
  }, [match.params.userId]);

  const goHome = () => {
    history.push("/saker/" + auth.isAuthenticated().user._id);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleStatusUpdateClose = () => {
    setOpenStatusUpdate({ ...openStatusUpdate, openStatusSnackbar: false });
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

  const getIssueByID = (id, token) => {
    const res = issueService.getIssueByID(id, token);
    res.then(function(result ) {
      setData(result);
    })

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

  const getComments = async () => {
    const jwt = auth.isAuthenticated();
    await issueService
    .getComments(id, jwt.token)
    .then((response) => {
      setComments(response.response.comments);
    })
    .catch((e) => {
      console.log("Comment error: ", e);
    })
  };

  const upDateIssueStatus = async (id, data) => {
    const jwt = auth.isAuthenticated();

    console.log("Status: " + id + JSON.stringify(data));
    await issueService
      .upDateIssueStatus(id, { status: data }, jwt.token)
      .then((response) => {
        setOpenStatusUpdate({ ...openStatusUpdate, openStatusSnackbar: true });
        setData({ ...dataset, status: data });
      })
      .catch((e) => {
        console.log("ISSUE UPDATE: ", e);
      });
  };

  const onDelete = async () => {
    const jwt = auth.isAuthenticated();

    const id = dataset._id;
    await issueService
      .deleteIssueByID(id, jwt.token)
      .then(() => {
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

  const onSubmit = async (data) => {
    const jwt = auth.isAuthenticated();
      let { _id } = auth.isAuthenticated().user;

      const commentData = {
        author: _id || undefined,
        content: data.content || undefined,
      };

      await issueService
        .addComment(commentData,jwt.token,id)
        .then(() => {
          getComments();
          setOpenNewComment(true);
        })
        .catch((e) => {
          console.log(e);
        });
  };

  useEffect(() => {
    let isSubscribed = true;
    if (isSubscribed)
    {
      const jwt = auth.isAuthenticated();
      getComments();
      getIssueByID(id, jwt.token);
    }
    return () => (isSubscribed = false);
  }, [setData, setComments]);

  const { verticalStatusUpdate, horizontalStatusUpdate, openStatusSnackbar } =
    openStatusUpdate;

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Slett sak"}</DialogTitle>
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
      <nav className={classes.drawer} aria-label="Drawer" />
      <div className="grid-container two-columns__center">
        <section className="two-columns__main">
          <div className="form-grid">
            <div className="item0">
              <IconButton onClick={goHome}>
                <ArrowBackIcon />
              </IconButton>
            </div>
            <div className="item1" style={{ paddingLeft: "5rem" }}>
              {dataset.reporter != null ? dataset.reporter.name : "Laster..."}
              <Typography>
                Opprettet: {formattedDate(dataset.createdAt)}
              </Typography>
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
                value={[dataset.delegated != null ? dataset.delegated.name : "Laster..."]}
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
              {comments ? <Comments comments={comments} /> : <Typography component={"p"} variant={"subtitle1"}>Ingen kommentarer</Typography>}
            </div>
            <div className="item17">
              <CommentForm onSubmit={onSubmit} openNewComment={opennewcomment} setOpenNewComment={setOpenNewComment} />
            </div>
          </div>
        </section>
        <aside className="two-columns__aside">
          <List className="side-menu">
            <ListItem primaryText="foo1" secondaryText="bar1">
              <Button
                variant="contained"
                color="primary"
                component={Link}
                startIcon={<EditIcon />}
                to={"/edit-issue/" + dataset._id}
                size="small"
                disabled={auth.isAuthenticated().user._id !== dataset.userid}
              >
                Rediger
              </Button>
              <Button
                variant="contained"
                color="secondary"
                className={classes.button}
                startIcon={<DeleteIcon />}
                size="small"
                onClick={handleClickOpen}
              >
                Slett sak
              </Button>
            </ListItem>
            <ListItem primaryText="foo1" secondaryText="bar1"></ListItem>
            <ListItem primaryText="foo1" secondaryText="bar1">
              <FormControl className={classes.textFieldStatus}>
                <TextField
                  id="outlined-select-status"
                  select
                  label="Status"
                  variant="outlined"
                  name="Status"
                  value={[dataset.status ? dataset.status : "Åpen"]}
                  InputProps={{
                    className: classes.input,
                  }}
                  SelectProps={{
                    MenuProps: {
                      className: classes.menu,
                    },
                  }}
                  inputProps={{ "aria-label": "naked" }}
                  onChange={(e) =>
                    upDateIssueStatus(dataset._id, e.target.value)
                  }
                >
                  {Status.map((option, key) => (
                    <MenuItem key={key} value={option.label}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <Snackbar
                  open={openStatusSnackbar}
                  autohideduration={3000}
                  onClose={handleStatusUpdateClose}
                  anchorOrigin={{
                    vertical: verticalStatusUpdate,
                    horizontal: horizontalStatusUpdate,
                  }}
                >
                  <Alert
                    severity="success"
                    variant="standard"
                    onClose={handleStatusUpdateClose}
                  >
                    <AlertTitle>Suksess</AlertTitle>
                    Status ble oppdatert!
                  </Alert>
                </Snackbar>
              </FormControl>
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
            </ListItem>
            <ListItem primaryText="foo1" secondaryText="bar1">
              Hello world
            </ListItem>
          </List>
        </aside>
      </div>
    </div>
  );
}