import React, { useState, useEffect } from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import issueService from "../../services/issueService";
import "../../App.css";
import moment from 'moment';
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import { Redirect, Link } from 'react-router-dom';
import MaterialTable from 'material-table';

import Avatar from "@material-ui/core/Avatar";
import { deepOrange, deepPurple } from "@material-ui/core/colors";
import Grid from "@material-ui/core/Grid";

const formattedDate = (value) => moment(value).format('DD/MM-YYYY');

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    padding: "7em"
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3)
  },
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 350
  },
  avatar: {
    margin: 10
  },
  purpleAvatar: {
    margin: 10,
    color: "#fff",
    backgroundColor: deepPurple[500]
  }
}));

export default function ViewIssue() {
  const classes = useStyles();
  const [dataset, setData] = useState([]);

   useEffect(() => {
      getIssueByID();
  }, [!dataset])

  const getIssueByID = async () => {
    let res = await issueService.getIssueByID('5da56028220aeb4adcdf8e44');  
    setData(res);
  }

  return (
    <div className={classes.root}>
      <Container>
        <Typography variant="h4" gutterBottom>
          {dataset.summary}
        </Typography>

        <div className="grid-container">
          <div className="item1">{dataset.name}</div>
          <div className="item2">
            <TextField
              id="standard-read-only-input"
              label="Prioritet"
              defaultValue="Prioritet"
              value={dataset.priority}
              className={classes.textField}
              margin="normal"
              InputProps={{
                readOnly: true
              }}
            />
          </div>
          <div className="item3">
            <TextField
              id="standard-read-only-input"
              label="Sist oppdatert"
              defaultValue="Sist oppdatert"
              value={formattedDate(dataset.updatedAt)}
              className={classes.textField}
              margin="normal"
              InputProps={{
                readOnly: true
              }}
            />
          </div>
          <div className="item4">Vedlegg</div>
          <div className="item5">Kategori</div>
          <div className="item6">
            <Grid container justify="center" alignItems="center">
              <Avatar
                alt="Profile picture"
                className={classes.purpleAvatar}
              ></Avatar>
            </Grid>
          </div>
          <div className="item7">Alvorlighetsgrad</div>
          <div className="item8">Mulighet å reprodusere</div>
          <div className="item9">Status</div>
          <div className="item10">Delegert til</div>
          <div className="item11">Oppsummering</div>
          <div className="item12">Beskrivelse</div>
          <div className="item13">Steg for å reprodusere</div>
          <div className="item14">Tilleggsinformasjon</div>
        </div>
      </Container>
    </div>
  );
}
