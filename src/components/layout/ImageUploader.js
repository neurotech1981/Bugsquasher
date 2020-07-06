import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import UploadIcon from '@material-ui/icons/CloudUpload';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import DeleteForeverRoundedIcon from '@material-ui/icons/DeleteForeverRounded';
import Snackbar from '@material-ui/core/Snackbar';
import axios from 'axios';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/styles';
import { useDispatch, useSelector } from 'react-redux';
import { addImageAction } from '../../redux/store';
import { deleteImageAction } from '../../redux/store';
import { clearAction } from '../../redux/store';
import uuid from 'uuid/v4';

function Alert(props) {
  return <MuiAlert elevation={1} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  root: {
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    border: 0,
    borderRadius: 3,
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    color: 'theme.palette.text.primary',
    height: 20,
    width: 20,
    padding: '0 0px',
  },
  icon: {
    margin: 'theme.spacing(1)',
    fontSize: 24,
    position: 'absolute',
    top: '0',
    right: '0',
    cursor: 'pointer',
    borderStyle: 'double',
    borderColor: 'black',
    color: 'black',
    backgroundColor: 'lightskyblue',
    boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .3)',
    transition: 'box-shadow 0.3s ease-in-out',
    '&:hover': {
      color: 'purple',
      boxShadow: '0 0px 2px 1px rgba(0, 0, 0, .3)',
    },
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

function Previews(props) {
  const classes = useStyles();
  const [files, setFiles] = useState([]);
  const [open, setOpen] = React.useState(false);
  const dispatch = useDispatch();
  const addImage = (files) => dispatch(addImageAction(files));
  const deleteImage = (files) => dispatch(deleteImageAction(files));
  const clearStoreImage = (files) => dispatch(clearAction(files));

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const images = useSelector((state) => state);

  const removeImage = (imageIndex) => {
    console.log('imageIndex', imageIndex);
    let array = [...files];
    if (imageIndex !== -1) {
      array = files.filter((_, index) => index !== imageIndex);
      console.log('Remove Image function: ', array);

      setFiles(
        array.map((file) =>
          Object.assign(file, {
            id: uuid(),
            preview: URL.createObjectURL(file),
          })
        )
      );
      console.log('Files Remove Image: ', images);
      acceptedFiles.splice(acceptedFiles.indexOf(imageIndex), 1);
      console.log('ACCEPTED FILES Remove Image Function: ', acceptedFiles);
      deleteImage({ name: array.map((file) => file) });
    }
  };

  function uploadToServer(e) {
    e.preventDefault();

    return new Promise((resolve, reject) => {
      setTimeout(resolve);
      let imageFormObj = new FormData();
      let imageDataSave = [];

      for (let x = 0; x < acceptedFiles.length; x++) {
        imageDataSave = { ...images.imageupload[1].name };
        imageFormObj.append('imageName', images.imageupload[1].name[x].path);
        imageFormObj.append('imageData', images.imageupload[1].name[x]);
      }

      axios.post('/api/uploadImage', imageFormObj).then((data) => {
        if (data.status === 200) {
          setOpen(true);
        }
      });
    }, 3000);
  }

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      setFiles([]);
      console.log('Accepted Files: ', acceptedFiles);
      clearStoreImage(clearAction);
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            id: uuid(),
            preview: URL.createObjectURL(file),
          })
        )
      );
      addImage({
        name: acceptedFiles.map((file) => file),
      });
    },
  });

  const thumbs = files.map((file, index) => (
    <div style={thumb} key={index}>
      <div style={thumbInner}>
        <DeleteForeverRoundedIcon
          onClick={() => removeImage(index)}
          className={classes.icon}
        />
        <img alt={file.name} src={file.preview} style={img} />
      </div>
    </div>
  ));

  useEffect(
    () => {
      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    },
    [] //files
  );

  const onSubmit = (event) => {
    event.preventDefault();
    addImage({
      id: uuid(),
      name: files,
    });
    setFiles('');
  };

  const handleChange = (event) => {
    setFiles(event.target.value);
  };

  return (
    <section>
      <div {...getRootProps({ className: 'dropzone' })}>
        <input
          {...getInputProps()}
          multiple
          name="imageData"
          encType="multipart/form-data"
          onDrop={handleChange}
        />
        <UploadIcon className="iconSmall" />
        <p>Dra og slipp filer her, eller klikk for å velge fil(er)</p>
      </div>
      <aside style={thumbsContainer}>{thumbs}</aside>
      <Button
        disabled={!files.length > 0}
        variant="contained"
        color="default"
        className={classes.button}
        onClick={(e) => uploadToServer(e)}
        style={{
          margin: '0 auto',
          display: 'flex',
          padding: '1rem',
        }}
      >
        Last opp bilder
        <Icon style={{ marginRight: '5px' }} className={classes.rightIcon}>
          cloud_upload
        </Icon>
      </Button>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" variant="standard">
          Bildet ble lastet opp!
        </Alert>
      </Snackbar>
    </section>
  );
}

export default Previews;
