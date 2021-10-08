import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton
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
  const jwt = auth.isAuthenticated();

  const classes = useStyles();
  return (
    <>
    <Typography component={"span"} variant={"subtitle1"}>
    Kommentarer ({comments.length})
  </Typography>
    <List className={classes.root}>
      {comments.map((result) => {
        return (
          <React.Fragment key={result._id}>
            <ListItem key={result._id} alignItems="flex-start">
              <ListItemAvatar>
                <Avatar alt="avatar" src={Faker.image.avatar()} />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <>
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
                    <IconButton size="small" aria-label="delete" color="secondary">
                      <DeleteIcon />
                    </IconButton>
                    <IconButton size="small" aria-label="delete" color="primary">
                      <EditIcon />
                    </IconButton>
                    </>
                    : <IconButton size="small" aria-label="delete" color="primary">
                        <ReplyIcon />
                      </IconButton>}
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
                  </>
                }
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
