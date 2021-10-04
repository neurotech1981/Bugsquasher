import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
} from "@material-ui/core";
import QueryBuilderIcon from "@material-ui/icons/QueryBuilder";
import AlternateEmailIcon from "@material-ui/icons/AlternateEmail";
import PersonPinIcon from "@material-ui/icons/PersonPin";
import Faker from "faker";

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
  },
  iconDate: {
    fontSize: "1.0rem",
    verticalAlign: "sub",
    fontWeight: "bold",
    marginRight: "5px",
  },
}));

const Comments = ({ comments }) => {
  const classes = useStyles();
  return (
    <List className={classes.root}>
      {comments.map((comment) => {
        console.log("Comment", comment);
        return (
          <React.Fragment key={comment.id}>
            <ListItem key={comment.id} alignItems="flex-start">
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
                      {comment.name}
                    </Typography>
                    <ListItemText>
                      <Typography
                        component={"span"}
                        variant={"subtitle1"}
                        className={classes.fontBody}
                      >
                        {comment.body}
                      </Typography>
                    </ListItemText>
                  </>
                }
                secondary={
                  <>
                    <Typography component={"span"} variant={"body2"}>
                      <QueryBuilderIcon className={classes.iconDate} />
                      01-12-2021 12:42
                    </Typography>
                    <Typography component={"span"} variant={"subtitle1"}>
                      {" "}
                      <AlternateEmailIcon className={classes.iconDate} />
                      {comment.email}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          </React.Fragment>
        );
      })}
    </List>
  );
};

export default Comments;
