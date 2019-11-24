import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import issueService from "../../services/issueService";
import "../../App.css";
import moment from 'moment';
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import InputLabel from "@material-ui/core/InputLabel";
import Avatar from "@material-ui/core/Avatar";
import { deepPurple } from "@material-ui/core/colors";
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
    width: "100%"
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
  const [images, setImages] = useState([]);

   useEffect(() => {
      getIssueByID();
  }, [!dataset])

  const getIssueByID = async () => {
    let res = await issueService.getIssueByID('5da56028220aeb4adcdf8e44');  
    setData(res);
    setImages(res.imageName)
  }

    var imgList = images.map(function(item) {
      return (
        <div style={{ display: "inline-flex", margin: "1em" }}>
          <img
            key={item}
            style={{ width: "150px", height: "150px", borderRadius: "1em" }}
            src={process.env.PUBLIC_URL + "/uploads/" + item}
          ></img>
        </div>
      );
    });

  return (
    <div className={classes.root}>
      <Container>
        <Typography variant="h4" gutterBottom></Typography>
        <div className="grid-container">
          <div className="item1">
            {dataset.name}
            <p style={{ fontSize: "0.6em", marginTop: "0.3em" }}>
              {formattedDate(dataset.createdAt)}
            </p>
          </div>
          <div className="item2">
            <TextField
              id="standard-read-only-input"
              label="Prioritet"
              value={[dataset.priority]}
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
              value={[formattedDate(dataset.updatedAt)]}
              className={classes.textField}
              margin="normal"
              InputProps={{
                readOnly: true
              }}
            />
          </div>
          <div className="item14">
            <InputLabel shrink htmlFor="select-multiple-native">
              Vedlegg
            </InputLabel>
            {imgList}
          </div>
          <div className="item4">
            {" "}
            <TextField
              id="standard-read-only-input"
              label="Kategori"
              value={dataset.category}
              defaultValue="Kategori"
              className={classes.textField}
              margin="normal"
              InputProps={{
                readOnly: true
              }}
            />
          </div>
          <div className="item6">
            <Grid container justify="center" alignItems="center">
              <Avatar
                alt="Profile picture"
                className={classes.purpleAvatar}
              ></Avatar>
            </Grid>
          </div>
          <div className="item7">
            {" "}
            <TextField
              id="standard-read-only-input"
              label="Alvorlighetsgrad"
              value={dataset.severity}
              defaultValue="Alvorlighetsgrad"
              className={classes.textField}
              margin="normal"
              InputProps={{
                readOnly: true
              }}
            />
          </div>
          <div className="item8">
            {" "}
            <TextField
              id="standard-read-only-input"
              label="Mulighet å reprodusere"
              value={dataset.reproduce}
              defaultValue="Mulighet å reprodusere"
              className={classes.textField}
              margin="normal"
              InputProps={{
                readOnly: true
              }}
            />
          </div>
          <div className="item9">
            {" "}
            <TextField
              id="standard-read-only-input"
              label="Status"
              value={dataset.status}
              defaultValue="Status"
              className={classes.textField}
              margin="normal"
              InputProps={{
                readOnly: true
              }}
            />
          </div>
          <div className="item5">
            {" "}
            <TextField
              id="standard-read-only-input"
              label="Delegert til"
              value={dataset.delegated}
              defaultValue="Ingen"
              className={classes.textField}
              margin="normal"
              InputProps={{
                readOnly: true
              }}
            />
          </div>
          <div className="item11">
            {" "}
            <TextField
              multiline
              id="standard-read-only-input"
              label="Oppsummering"
              value={dataset.summary}
              defaultValue="Oppsummering"
              className={classes.textField}
              margin="normal"
              InputProps={{
                readOnly: true
              }}
            />
          </div>
          <div className="item12">
            {" "}
            <TextField
              multiline
              id="standard-read-only-input"
              label="Beskrivelse"
              value={dataset.description}
              defaultValue="Beskrivelse"
              className={classes.textField}
              margin="normal"
              InputProps={{
                readOnly: true
              }}
            />
          </div>
          <div className="item13">
            {" "}
            <TextField
              multiline
              id="standard-read-only-input"
              label="Steg for å reprodusere"
              value={dataset.step_reproduce}
              defaultValue="Steg for å reprodusere"
              className={classes.textField}
              margin="normal"
              InputProps={{
                readOnly: true
              }}
            />
          </div>
          <div className="item10">
            {" "}
            <TextField
              multiline
              id="standard-read-only-input"
              label="Tilleggsinformasjon"
              value={dataset.additional_info}
              defaultValue="Tilleggsinformasjon"
              className={classes.textField}
              margin="normal"
              InputProps={{
                readOnly: true
              }}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
