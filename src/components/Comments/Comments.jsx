import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  List,
  ListItem,
  Divider,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography
} from "@material-ui/core";
import QueryBuilderIcon from '@material-ui/icons/QueryBuilder';
import AlternateEmailIcon from '@material-ui/icons/AlternateEmail';
import PersonPinIcon from '@material-ui/icons/PersonPin';
import Faker from "faker";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100ch",
    backgroundColor: theme.palette.background.paper,
  },
  fonts: {
    fontWeight: "bold",
    fontSize: "0.8em",
    color: "black",
    verticalAlign: "middle",
  },
  fontEmail: {
    color: "black",
    fontSize: "0.8em",
    verticalAlign: "middle",
  },
  inline: {
    display: "inline"
  },
  fontDate: {
    color: "black",
    fontSize: "0.8em",
    verticalAlign: "middle",
  },
  iconDate: {
    fontSize: "0.8em",
    fontWeight: "bold",
    marginRight: "5px",
  },
}));

const Comments = ({ comments }) => {
  const classes = useStyles();
  return (
    <List className={classes.root}>
      {comments.map(comment => {
        console.log("Comment", comment);
        return (
          <React.Fragment key={comment.id}>
            <ListItem key={comment.id} alignItems="flex-start">
              <ListItemAvatar>
                <Avatar alt="avatar" src={Faker.image.avatar()} />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography className={classes.fonts}>
                    <PersonPinIcon className={classes.iconDate}/>{comment.name}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      className={classes.inline}
                      color="textPrimary"
                    >
                    <ListItemText primary={
                    <>
                    <Typography className={classes.fontDate}>
                    <QueryBuilderIcon className={classes.iconDate} />
                    01-12-2021 12:42
                    </Typography>
                    <Typography className={classes.fontEmail}><AlternateEmailIcon className={classes.iconDate} />{comment.email}</Typography><Divider/></>
                    }/>
                    </Typography>
                    {comment.body}
                  </>
                }
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        );
      })}
    </List>
  );
};

export default Comments;