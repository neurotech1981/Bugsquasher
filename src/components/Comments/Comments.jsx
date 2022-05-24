import React, { useState } from "react";
import { makeStyles, alpha } from "@material-ui/core/styles";
import {
  List,
  ListItemText,
  Avatar,
  Typography,
  IconButton,
  Button,
  TextField,
  Box,
  Divider,
  Zoom
} from "@material-ui/core";
import QueryBuilderIcon from "@material-ui/icons/QueryBuilder";
import PersonPinIcon from "@material-ui/icons/PersonPin";
import { randAvatar } from '@ngneat/falso';
import moment from "moment";
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import ReplyIcon from '@material-ui/icons/Reply';
import issueService from "../../services/issueService";
import auth from "../auth/auth-helper";

import { Grid } from "@material-ui/core";


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
    //borderLeft: `2px solid ${alpha(theme.palette.text.primary, 0.4)}`,
  },
  indent: {
    marginLeft: 20,
    paddingLeft: "12px",
    borderLeft: `2px solid ${alpha(theme.palette.text.primary, 0.4)}`,
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

const Comments = ({ comments, issueID, userID }) => {

  const jwt = auth.isAuthenticated();
  const [hidden, setHidden] = useState({});
  const [reply, setReply] = useState("");

  const toggleHide = index => {
    setHidden({ ...hidden, [index]: !hidden[index] });
  };
  const [hiddenReply, setHiddenReply] = useState({});
  const toggleHideReply = index => {
    setHiddenReply({ ...hiddenReply, [index]: !hiddenReply[index] });
  };

  const handleChange = (event) => {
    setReply(event.target.value);
  };

  const submitReply = (commentID) => {
    console.log("submit reply", reply, commentID, issueID, userID);
    const jwt = auth.isAuthenticated();

    issueService.addCommentReply(userID, reply, jwt.token, issueID, commentID).then((data) => {
      console.log("reply added", data.data.response[0].comments)
      let array = [...comments]
      array.push(data.data.response[0].comments);
      comments.push(...array);
    }).catch((error) =>
    {
      console.log("Error", error);
    });
  }


  const classes = useStyles();
  return (
    <>
  <Typography component={"span"} variant={"subtitle1"}>
    Kommentarer ({comments.length})
  </Typography>
      {comments.map((result, index) => {
        return (

          <React.Fragment key={index}>



            <Grid container wrap="nowrap" spacing={1} key={result._id}>
              <Grid item>
                <Avatar alt="Remy Sharp" src={randAvatar()} />
              </Grid>
              <Grid justifyContent="left" item xs zeroMinWidth>
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
                      </IconButton>
                }
                <p style={{ textAlign: "left" }}>
                  {result.content}{" "}
                </p>
                <p style={{ textAlign: "left", color: "gray" }}>
                  postet {formattedDate(result.updatedAt)}
                  {result._id}
                </p>
                {!!hidden[index] && <Zoom in={hidden[index]}><div key={index} >
                  <TextField id="outlined-basic" key={index} label="Svar" variant="outlined" onChange={(e) => handleChange(e)}/>
                  <Box mt={1}>
                    <Typography component={"p"} variant={"subtitle"} >
                      <Button variant="contained" color="primary" onClick={() => submitReply(result._id)}>Svar</Button>
                    </Typography>
                  </Box>
                  </div>
                  </Zoom>
                }
              </Grid>
            </Grid>
              {result.comments.map((result, index) => {
                      return (
                      <>
                      <Grid className={classes.commentIndent} justifyContent="left" item xs zeroMinWidth key={index}>
                        <Grid item>
                          <List style={{ textAlign: "left", color: "gray" }} className={classes.commentIndent}>
                          <PersonPinIcon className={classes.iconDate} />
                            {result.author.name}
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
                              <ReplyIcon key={index} onClick={() => toggleHideReply(index)}/>
                            </IconButton>}
                          <ListItemText>
                            <Typography
                              component={"span"}
                              variant={"subtitle1"}
                              className={classes.fontBody}
                            >
                              {result.content}
                            </Typography>
                            <Typography component={"p"} variant={"body1"} style={{ textAlign: "left", color: "gray" }}>
                              <QueryBuilderIcon className={classes.iconDate} />
                              {formattedDate(result.updatedAt)}
                            </Typography>
                            {!!hiddenReply[index] && <Zoom in={hiddenReply[index]}><div key={index}>
                              {result._id}
                                <TextField id="outlined-basic" key={index} label="Svar" variant="outlined" onChange={(e) => handleChange(e)} />
                                <Box mt={1}>
                                  <Typography component={"p"} variant={"subtitle"} >
                                    <Button variant="contained" color="primary" onClick={() => submitReply(result._id)}>Svar</Button>
                                  </Typography>
                                </Box>
                                </div>
                              </Zoom>
                            }
                          </ListItemText>
                          </List>
                        </Grid>
                      </Grid>
                      </>
              )})}

            <Divider variant="fullWidth" style={{ margin: "10px 0" }} />

          </React.Fragment>

        );
      })}

    </>
  );
};

export default Comments;
