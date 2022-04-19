import React, { useState } from "react";
//import { useParams } from "react-router-dom";
import { makeStyles, fade } from "@material-ui/core/styles";
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton,
  Button,
  TextField,
  Box
} from "@material-ui/core";
import QueryBuilderIcon from "@material-ui/icons/QueryBuilder";
import AlternateEmailIcon from "@material-ui/icons/AlternateEmail";
import PersonPinIcon from "@material-ui/icons/PersonPin";
import Faker from "faker";
import moment from "moment";
import auth from "../auth/auth-helper";
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import ReplyIcon from '@material-ui/icons/Reply';

const formattedDate = (value) => moment(value).format("DD/MM-YYYY HH:mm");


const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
    borderRadius: "1rem",
  },
  fontName: {
    fontWeight: "bold",
    color: "black",
    verticalAlign: "middle",
  },
  fontEmail: {
    color: "black",
    fontSize: "0.8em",
    verticalAlign: "middle",
  },
  commentIndent: {
    marginLeft: 20,
    paddingLeft: "20px",
    borderLeft: `1px dashed ${fade(theme.palette.text.primary, 0.4)}`
  },
  indent: {
    marginLeft: 20,
    paddingLeft: "12px",
    borderLeft: `2px solid ${fade(theme.palette.text.primary, 0.4)}`,
  },
  indentAvatarImg: {
    marginLeft: 20,
    paddingLeft: "12px",
  },
  inline: {
    display: "inline",
  },
  fontBody: {
    color: "black",
    verticalAlign: "middle",
    overflowWrap: "break-word",
  },
  iconDate: {
    fontSize: "1.0rem",
    verticalAlign: "sub",
    fontWeight: "bold",
    marginRight: "5px",
  },
}));

const Comments = ({ comments }) => {
  //const { id } = useParams();

  const jwt = auth.isAuthenticated();
  const [hidden, setHidden] = useState({});
  const toggleHide = index => {
    setHidden({ ...hidden, [index]: !hidden[index] });
  };
  const [hiddenReply, setHiddenReply] = useState({});
  const toggleHideReply = index => {
    setHiddenReply({ ...hiddenReply, [index]: !hiddenReply[index] });
  };


  const classes = useStyles();
  return (
    <>
    <Typography component={"span"} variant={"subtitle1"}>
    Kommentarer ({comments.length})
  </Typography>
    <List className={classes.root}>
      {comments.map((result, index) => {
        return (
          <React.Fragment key={result._id}>

            <ListItem key={result._id} alignItems="flex-start">
              <ListItemText
                primary={
                  <>
                    <ListItem className={classes.fontBody} style={{ width: '100%', maxWidth: "50%", left: '-120px', top: '-10px' }}>
                      <ListItemAvatar>
                        <Avatar alt="avatar" src={Faker.image.avatar()} />
                      </ListItemAvatar>
                      {result.author.name}
                    {result.author._id === jwt.user._id ?
                    <>
                    <IconButton size="small" aria-label="delete" color="secondary">
                      <DeleteIcon />
                    </IconButton>
                    <IconButton size="small" aria-label="edit" color="primary">
                      <EditIcon />
                    </IconButton>
                    </>
                    : <IconButton size="small" aria-label="reply" color="primary">
                        <ReplyIcon key={result._id} onClick={() => toggleHide(index)}/>
                      </IconButton>}
                    </ListItem>
                    <ListItemText>
                      <Typography
                        component={"span"}
                        variant={"subtitle1"}
                        className={classes.fontBody}
                      >
                        {result.content}
                      </Typography>
                    </ListItemText>
                  </>
                }
                secondary={
                  <>
                    <Typography component={"span"} variant={"body2"}>
                      <QueryBuilderIcon className={classes.iconDate} />
                      {formattedDate(result.updatedAt)}
                    </Typography>
                    <Typography component={"span"} variant={"subtitle1"}>
                      {" "}
                      <AlternateEmailIcon className={classes.iconDate} />
                      {result.author.email}
                    </Typography>
                    {!!hidden[index] && <div key={index} >
                        <TextField id="outlined-basic" key={index} label="Svar" variant="outlined" />
                        <Box mt={1}>
                          <Typography component={"p"} variant={"subtitle"} >
                            <Button variant="contained" color="primary">Svar</Button>
                          </Typography>
                        </Box>
                        </div>
                        }
                    {result.comments.map((result, index) => {
                      return (
                      <>
                      <br />
                        <Typography
                        component={"span"}
                        variant={"body2"}
                        className={classes.fontName}
                      >
                        <PersonPinIcon className={classes.iconDate} />
                        {result.author.name}
                      </Typography>
                      {result.author._id === jwt.user._id ?
                      <>
                      <Typography
                        component={"p"}
                        variant={"body2"}
                        className={[classes.fontName, classes.commentIndent].join(" ")}
                      >
                        <PersonPinIcon className={classes.iconDate} />
                        {result.author.name}
                      </Typography>
                      <IconButton size="small" aria-label="delete" color="secondary">
                        <DeleteIcon />
                      </IconButton>
                      <IconButton size="small" aria-label="delete" color="primary">
                        <EditIcon />
                      </IconButton>
                      </>
                      : <IconButton size="small" aria-label="delete" color="primary">
                          <ReplyIcon key={result._id} onClick={() => toggleHideReply(index)}/>
                        </IconButton>}
                      <ListItemText>
                        <Typography
                          component={"span"}
                          variant={"subtitle1"}
                          className={[classes.fontBody, classes.commentIndent].join(" ")}
                        >
                          {result.content}
                        </Typography>
                        {!!hiddenReply[index] && <div key={index} >
                        <TextField id="outlined-basic" key={index} label="Svar" variant="outlined" />
                        <Box mt={1}>
                          <Typography component={"p"} variant={"subtitle"} >
                            <Button variant="contained" color="primary">Svar</Button>
                          </Typography>
                        </Box>
                        </div>
                        }
                      </ListItemText>
                      </>
                    )})}
                  </>
                }
                className={classes.indent}
              />
            </ListItem>
          </React.Fragment>
        );
      })}
    </List>
    </>
  );
};

export default Comments;
