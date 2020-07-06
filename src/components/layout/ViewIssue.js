import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import issueService from '../../services/issueService';
import '../../App.css';
import moment from 'moment';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import DeleteForeverRoundedIcon from '@material-ui/icons/DeleteForeverRounded';
import InputLabel from '@material-ui/core/InputLabel';
import Avatar from '@material-ui/core/Avatar';
import { deepPurple } from '@material-ui/core/colors';
import Grid from '@material-ui/core/Grid';
import useReactRouter from 'use-react-router';
import { Link } from 'react-router-dom';
import EditIcon from '@material-ui/icons/Edit';

const drawerWidth = 240;

const formattedDate = (value) => moment(value).format('DD/MM-YYYY');

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    paddingTop: '90px',
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '100%',
    backgroundColor: 'white',
  },
  avatar: {
    margin: 10,
  },
  purpleAvatar: {
    margin: 5,
    color: '#fff',
    backgroundColor: deepPurple[500],
  },
}));

const thumbsContainer = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginTop: 16,
};

const thumb = {
  display: 'inline-flex',
  position: 'relative',
  borderRadius: 2,
  border: '3px solid #eaeaea',
  marginBottom: 8,
  marginRight: 4,
  width: 150,
  height: 150,
  padding: 4,
  boxSizing: 'border-box',
  margin: '0 auto',
};

const thumbInner = {
  display: 'flex',
  minWidth: 0,
  overflow: 'hidden',
};

const img = {
  display: 'block',
  width: 'auto',
  height: '100%',
};

export default function ViewIssue(props) {
  const { history, location, match } = useReactRouter();
  const classes = useStyles();
  const [dataset, setData] = useState(['']);
  const [images, setImages] = useState([]);
  const [value, setValue] = useState('');
  const [edit, setEdit] = useState(false);

  const [selectedDate, setSelectedDate] = React.useState(dataset.updatedAt);

  const handleChange = (event) => {
    setData(event.target.value);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const onEditClick = () => {
    setEdit(true);
  };

  const { id } = props.match.params;

  useEffect(() => {
    getIssueByID(id);
  }, [id]);

  const getIssueByID = async (id) => {
    let res = await issueService.getIssueByID(id);
    setData(res);
    if (res.imageName === null) {
      setImages(['none']);
    } else {
      setImages(res.imageName[0]);
    }

    console.log(res);
  };

  const thumbs = images.map((file, index) => (
    <div style={thumb} key={index}>
      <div style={thumbInner}>
        <DeleteForeverRoundedIcon className={classes.icon} />
        <img alt={file.name} src={file.path} style={img} />
      </div>
    </div>
  ));

  useEffect(
    () => {
      // Make sure to revoke the data uris to avoid memory leaks
      images.forEach((file) => URL.revokeObjectURL(file.path));
    },
    [] //files
  );

  const imgList = images.map((file, index) => {
    if (file === 'none') {
      return <div key={index}>Ingen vedlegg</div>;
    }
    return (
      <div style={{ display: 'grid', margin: '1em' }} key={index}>
        <Link
          to={process.env.PUBLIC_URL + '/uploads/' + file.path}
          target="_blank"
          download
        >
          <img
            key={index}
            style={{
              width: '150px',
              height: '150px',
              borderRadius: '0.5em',
            }}
            src={process.env.PUBLIC_URL + '/uploads/' + file.path}
          ></img>
        </Link>
        <div
          style={{
            display: 'inline-flex',
            margin: '1em',
            height: '40px',
          }}
        >
          <Link
            to={process.env.PUBLIC_URL + '/uploads/' + file.path}
            target="_blank"
            download
          >
            <Button variant="contained" color="default">
              Download
            </Button>
          </Link>
        </div>
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
          <div className="item1">
            {dataset.name}
            <p style={{ fontSize: '0.6em', marginTop: '0.3em' }}>
              Opprettet: {formattedDate(dataset.createdAt)}
            </p>
            <Button
              variant="contained"
              color="default"
              className={classes.button}
              startIcon={<EditIcon />}
              size="small"
            >
              Edit
            </Button>
          </div>
          <div className="item2">
            <TextField
              label="Priority"
              value={dataset.priority ? dataset.priority : ' '}
              className={classes.textField}
              margin="normal"
              variant="outlined"
              onChange={handleChange}
              InputProps={{
                readOnly: true,
              }}
            />
          </div>
          <div className="item3">
            <TextField
              label="Last updated"
              value={formattedDate(dataset.updatedAt)}
              className={classes.textField}
              margin="normal"
              variant="outlined"
              onChange={handleChange}
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
              value={[dataset.category] ? props.selectedValue : ' '}
              defaultValue="Kategori"
              className={classes.textField}
              margin="normal"
              variant="outlined"
              InputProps={{
                readOnly: true,
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
            <TextField
              label="Alvorlighetsgrad"
              value={[dataset.severity] ? props.selectedValue : ' '}
              defaultValue="Alvorlighetsgrad"
              className={classes.textField}
              margin="normal"
              variant="outlined"
              InputProps={{
                readOnly: true,
              }}
            />
          </div>
          <div className="item8">
            <TextField
              label="Mulighet å reprodusere"
              value={[dataset.reproduce] ? props.selectedValue : ' '}
              defaultValue="Mulighet å reprodusere"
              className={classes.textField}
              margin="normal"
              variant="outlined"
              InputProps={{
                readOnly: true,
              }}
            />
          </div>
          <div className="item9">
            <TextField
              label="Status"
              value={[dataset.status] ? props.selectedValue : ' '}
              defaultValue="Status"
              className={classes.textField}
              margin="normal"
              variant="outlined"
              InputProps={{
                readOnly: true,
              }}
            />
          </div>
          <div className="item15">
            <TextField
              label="Delegert til"
              value={dataset.delegated}
              defaultValue="Ingen"
              className={classes.textField}
              margin="normal"
              variant="outlined"
              InputProps={{
                readOnly: true,
              }}
            />
          </div>
          <div className="item11">
            <TextField
              multiline
              label="Oppsummering"
              value={dataset.summary}
              defaultValue="Oppsummering"
              className={classes.textField}
              margin="normal"
              variant="outlined"
              InputProps={{
                readOnly: true,
              }}
            />
          </div>
          <div className="item12">
            <TextField
              multiline
              rowsMax="8"
              variant="outlined"
              label="Beskrivelse"
              value={dataset.description}
              defaultValue="Beskrivelse"
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
              variant="outlined"
              rows="10"
              label="Steg for å reprodusere"
              value={dataset.step_reproduce}
              defaultValue="Steg for å reprodusere"
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
              variant="outlined"
              label="Tilleggsinformasjon"
              value={dataset.additional_info}
              defaultValue="Tilleggsinformasjon"
              className={classes.textField}
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
