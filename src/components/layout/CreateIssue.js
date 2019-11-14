import React, { useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import Container from '@material-ui/core/Container';
import axios from 'axios';
import Previews from './ImageUploader';
import { useSelector } from 'react-redux';
import classnames from "classnames";
import Box from '@material-ui/core/Box';


const alvorlighetsGrad = [
  {
    value: 0,
    label: 'Ingen valgt'
  },
  {
    value: 1,
    label: 'Tekst'
  },
  {
    value: 2,
    label: 'Justering'
  },
  {
    value: 3,
    label: "Triviell"
  },
  {
    value: 4,
    label: 'Mindre alvorlig',
  },
  {
    value: 5,
    label: 'Alvorlig'
  },
  {
    value: 6,
    label: 'Kræsj'
  },
  {
    value: 7,
    label: 'Blokkering'
  }
];

const Kategori = [
  {
    value: 0,
    label: 'Ingen valgt'
  },
  {
    value: 1,
    label: 'Triviell'
  },
  {
    value: 2,
    label: 'Tekst'
  },
  {
    value: 3,
    label: 'Justering'
  },
  {
    value: 4,
    label: 'Mindre alvorlig'
  },
  {
    value: 5,
    label: 'Alvorlig'
  },
  {
    value: 6,
    label: 'Kræsj'
  },
  {
    value: 7,
    label: 'Blokkering'
  }
];

const prioritet = [
  {
    value: 0,
    label: 'Ingen valgt'
  },
  {
    value: 1,
    label: 'Ingen'
  },
  {
    value: 2,
    label: 'Lav'
  },
  {
    value: 3,
    label: 'Normal'
  },
  {
    value: 4,
    label: 'Høy'
  },
  {
    value: 5,
    label: 'Haster'
  },
  {
    value: 6,
    label: 'Øyeblikkelig'
  }
];

const reprodusere = [
  {
    value: 0,
    label: 'Ingen valgt',
    color: '#F2CBD1'
  },
  {
    value: 2,
    label: 'Alltid',
    color: '#F2CBD1'
  },
  {
    value: 3,
    label: 'Noen ganger',
    color: '#F49CA9'
  },
  {
    value: 4,
    label: 'Tilfeldig',
    color: '#F26A7E'
  },
  {
    value: 5,
    label: 'Har ikke forsøkt',
    color: '#F20024'
  },
  {
    value: 6,
    label: 'Kan ikke reprodusere',
    color: '#870D1F'
  },
  {
    value: 7,
    label: 'Ingen',
    color: '#7B0C1D'
  }
];
const useStyles = makeStyles(theme => ({
  headerOne: {
    margin: '0 auto',
    padding: '16px',
    fontSize: '3em',
    color: 'darkslategray',
    textTransform: 'uppercase'
  },
  active: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)'
  },
  container: {
    paddingTop: '50px',
    marginTop: '100px',
    marginBottom: '100px',
    padding: '50px',
    paddingBottom: '50px',
    display: 'grid',
    flexWrap: 'wrap',
    maxWidth: '700px',
    borderRadius: '25px',
    backgroundImage: 'linear-gradient(to bottom, #dffff8 0%, #6fffca0f 100%)',
    boxShadow: '1px 1px 15px 0 rgba(0,0,0,.14)',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    height: '100%',
    margin: '0 auto',
    marginLeft: '200px'
  },
  input: {
    backgroundColor: 'white',
    boxShadow: 'inset 3px 3px 4px rgba(0, 0, 0, 0.15)',
    webkitTransition: '0.18s ease-out',
    mozTransition: '0.18s ease-out',
    oTransition: '0.18s ease-out',
    transition: '0.18s ease-out'
  },
  textField: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  },
  dense: {
    marginTop: theme.spacing(2)
  },
  menu: {
    width: 200
  },
  button: {
    marginTop: '20px',
    width: '40%',
    height: '50px',
    margin: '0 auto',
    fontSize: 20,
    borderRadius: 15
  },
  leftIcon: {
    marginRight: theme.spacing(1)
  },
  rightIcon: {
    marginLeft: theme.spacing(1)
  },
  iconSmall: {
    fontSize: '1.2em'
  },
  selected: {
    '&:hover': {
      backgroundColor: 'green',
      color: 'green'
    }
  }
}));

export default function CreateIssue() {
  const initialState = {
    data: [''],
    setID: 0,
    setNavn: '',
    setKategori: 'Ingen valgt',
    setAlvorlighetsgrad: 'Ingen valgt',
    setPrioritet: 'Ingen valgt',
    setReprodusere: 'Ingen valgt',
    setOppsummering: '',
    setBeskrivelse: '',
    setStegReprodusere: '',
    setTillegg: '',
    setStatus: 'Åpen',
    setImageName: [''],
    errors: ''
  };

  const classes = useStyles();
  const [values, setValues] = useState(initialState);

  const images = useSelector(state => state);

  const handleChange = name => event => {
    setValues({
      ...values,
      [name]: event.target.value,
    });
  };

  function setDefaultImage(uploadType) {
    if (uploadType === 'baseImage') {
      setValues({
        baseImage: 'no image'
      });
    } else {
      setValues({
        baseImage: ''
      });
    }
  }

  // Legg inn ny query / varelinje i database med backend API
  function putDataToDB() {
    axios
      .post('/api/putData', {
        name: values.setNavn,
        category: values.setKategori,
        description: values.setBeskrivelse,
        reproduce: values.setReprodusere,
        severity: values.setAlvorlighetsgrad,
        priority: values.setPrioritet,
        summary: values.setOppsummering,
        step_reproduce: values.setStegReprodusere,
        additional_info: values.setTillegg,
        status: values.setStatus,
        imageName: values.setImageName
      })
      .then(data => {
        if (data.status === 200) {
          alert('Issue successfully posted');
          setValues({errors: ''})
          clearState();
          //imageFormObj = new FormData();
          //setDefaultImage('baseImage');
        }
      })
      .catch(err => setValues({ errors: err.response.data }));
    // clear errors on submit if any present, before correcting old error
    
  }

    const handleChangeMulter = e => {
    let imageFormObj = new FormData();
    //setDisabled({ value: false });
    for (var x = 0; x < e.target.files.length; x++) {
      imageFormObj.append(
        "imageName",
        "multer-image-" + e.target.files[x].name + Date.now()
      );

      imageFormObj.append("imageData", e.target.files[x]);
      // store a readable instance of
      // the image being uploaded using multer
    }
    let imgData = imageFormObj.get("imageData");

    setValues({
      imageData: imgData
    });
  };

  function uploadToServer(e) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve);
      let imageFormObj = new FormData();
      let imageDataSave = [];
      //setDisabled({ value: false });
      for (let x = 0; x < images.imageupload[1].name.length; x++) {
        imageDataSave = {...images.imageupload[1].name};
        imageFormObj.append(
          "imageName", images.imageupload[1].name[x].path[x]
        );
        imageFormObj.append("imageData", images.imageupload[1].name[x]);
        // store a readable instance of
        // the image being uploaded using multer
      }
      setValues({ ...values, setImageName: [images.imageupload[1].name.map(file => file.path)] });
      e.preventDefault();
      // store a readable instance of
      // the image being uploaded using multer

        axios.post('/api/uploadImage', imageFormObj).then(data => {
          if (data.status === 200) {
            alert('Image was uploaded successfully');
            //setDefaultImage('multer');
            //setDisabled({ value: true });     
            }
        });
    }, 3000);
  }
  
  const clearState = () => {
    setValues({...initialState});
  };

  const handleSubmit = e => {
    e.preventDefault();
    putDataToDB();
  };

  return (
    <Container>
      <form
        encType='multipart/form-data'
        className={classes.container}
        autoComplete='off'
        onSubmit={e => handleSubmit(e)}
      >
        <h1 className={classes.headerOne}>Skriv inn saksdetaljer</h1>
        <TextField
          id='outlined-navn-input'
          label='Navn'
          name='navn'
          //className={classes.textField}
          className={classnames([classes.textField], {
            "is-invalid": values.errors.name
          })}
          value={[values.setNavn]}
          onChange={handleChange('setNavn')}
          InputProps={{
            className: classes.input
          }}
          margin='normal'
          variant='outlined'
        />{values.errors && (
           <Box fontFamily="Monospace" color="error.main" p={1} m={1}>{values.errors.name} ⚠️</Box>
          )}
        <TextField
          id='outlined-select-alvorlighetsgrad'
          select
          label='Kategori'
          name='kategori'
          className={classes.textField}
          value={values.setKategori || "Ingen valgt"}
          onChange={handleChange('setKategori')}
          InputProps={{
            className: classes.input
          }}
          SelectProps={{
            MenuProps: {
              className: classes.menu
            }
          }}
          helperText='Velg alvorlighet på sak'
          margin='normal'
          variant='outlined'
        >
          {Kategori.map((option, index) => (
            <MenuItem key={index} value={option.label}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        {values.errors && (
            <Box fontFamily="Monospace" color="error.main" p={1} m={1}>{values.errors.category} ⚠️</Box>
          )}
        <TextField
          id='outlined-select-alvorlighetsgrad'
          select
          name='alvorlighetsgrad'
          label='Alvorlighetsgrad'
          value={values.setAlvorlighetsgrad  || "Ingen valgt"}
          className={classes.textField}
          onChange={handleChange('setAlvorlighetsgrad')}
          InputProps={{
            className: classes.input
          }}
          SelectProps={{
            MenuProps: {
              className: classes.menu
            }
          }}
          helperText='Velg alvorlighet på sak'
          margin='normal'
          variant='outlined'
        >
          {alvorlighetsGrad.map((option, index) => (
            <MenuItem key={index} value={option.label}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        {values.errors && (
            <Box fontFamily="Monospace" color="error.main" p={1} m={1}>{values.errors.severity} ⚠️</Box>
          )}
        <TextField
          id='outlined-select-prioritet'
          select
          name='prioritet'
          label='Prioritet'
          className={classes.textField}
          value={values.setPrioritet || "Ingen valgt"}
          onChange={handleChange('setPrioritet')}
          InputProps={{
            className: classes.input
          }}
          SelectProps={{
            MenuProps: {
              className: classes.menu
            }
          }}
          helperText='Velg prioritet på sak'
          margin='normal'
          variant='outlined'
        >
          {prioritet.map((option, index) => (
            <MenuItem key={index} value={option.label}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
          {values.errors && (
            <Box fontFamily="Monospace" color="error.main" p={1} m={1}>{values.errors.priority} ⚠️</Box>
          )}
        <TextField
          id='outlined-select-prioritet'
          select
          name='reprodusere'
          label='Mulighet for å reprodusere	'
          className={classes.textField}
          value={values.setReprodusere || "Ingen valgt"}
          onChange={handleChange('setReprodusere')}
          InputProps={{
            className: classes.input
          }}
          SelectProps={{
            MenuProps: {
              className: classes.menu
            }
          }}
          helperText='Mulighet for å reprodusere'
          margin='normal'
          variant='outlined'
        >
          {reprodusere.map((option, index) => (
            <MenuItem
              key={index}
              value={option.label}
              selected
              style={{
                backgroundColor: option.color,
                color: 'white'
              }}
            >
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        {values.errors && (
            <Box fontFamily="Monospace" color="error.main" p={1} m={1}>{values.errors.reproduce} ⚠️</Box>
        )}
        <TextField
          id='outlined-oppsummering'
          label='Oppsummering'
          name='oppsummering'
          value={[values.setOppsummering]}
          onChange={handleChange('setOppsummering')}
          className={classes.textField}
          InputProps={{
            className: classes.input
          }}
          margin='normal'
          variant='outlined'
        />
        {values.errors && (
          <Box fontFamily="Monospace" color="error.main" p={1} m={1}>{values.errors.summary} ⚠️</Box>
         )}
        <TextField
          id='outlined-beskrivelse-input'
          label='Beskrivelse'
          name='beskrivelse'
          value={[values.setBeskrivelse]}
          onChange={handleChange('setBeskrivelse')}
          className={classes.textField}
          InputProps={{
            className: classes.input
          }}
          multiline
          rows='8'
          margin='normal'
          variant='outlined'
        />
        {values.errors && (
           <Box fontFamily="Monospace" color="error.main" p={1} m={1}>{values.errors.description} ⚠️</Box>
        )}
        <TextField
          id='outlined-reprodusere-input'
          label='Steg for å reprodusere	'
          className={classes.textField}
          value={values.setStegReprodusere}
          onChange={handleChange('setStegReprodusere')}
          InputProps={{
            className: classes.input
          }}
          name='reprodusere'
          multiline
          rows='8'
          margin='normal'
          variant='outlined'
        />
        {values.errors && (
            <Box fontFamily="Monospace" color="error.main" p={1} m={1}>{values.errors.step_reproduce} ⚠️</Box>
        )}
        <TextField
          id='outlined-multiline-static'
          label='Tilleggsinformasjon'
          name='tilleggsinformasjon'
          multiline
          rows='8'
          className={classes.textField}
          value={values.setTillegg}
          onChange={handleChange('setTillegg')}
          InputProps={{
            className: classes.input
          }}
          margin='normal'
          variant='outlined'
        />
        {values.errors && (
            <Box fontFamily="Monospace" color="error.main" p={1} m={1}>{values.errors.additional_info} ⚠️</Box>
        )}
        <Previews />
        <Button
          disabled={!images.imageupload[1] > 0}
          variant='contained'
          color='default'
          className={classes.button}
          onClick={e => uploadToServer(e)}
        >
          Last opp bilder
          <Icon className={classes.rightIcon}>cloud_upload</Icon>
        </Button>        
        <Button
          type='submit'
          value='Submit'
          variant='contained'
          color='primary'
          className={classes.button}
          //onClick={e => handleSubmit(e)}
        >
          Send inn sak
          <Icon className={classes.rightIcon}>send</Icon>
        </Button>
      </form>
    </Container>
  );
}
