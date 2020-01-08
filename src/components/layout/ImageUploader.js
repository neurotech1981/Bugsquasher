import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import UploadIcon from "@material-ui/icons/CloudUpload";
import Button from "@material-ui/core/Button";
import DeleteForeverRoundedIcon from "@material-ui/icons/DeleteForeverRounded";

import { makeStyles } from "@material-ui/styles";
import { useDispatch } from "react-redux";
import { addImageAction } from "../../redux/store";
import { deleteImageAction } from "../../redux/store";
import { clearAction } from "../../redux/store";
import uuid from "uuid/v4";

const useStyles = makeStyles(theme => ({
  root: {
    background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
    border: 0,
    borderRadius: 3,
    boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
    color: "theme.palette.text.primary",
    height: 20,
    width: 20,
    padding: "0 0px"
  },
  icon: {
    margin: "theme.spacing(1)",
    fontSize: 32,
    position: "absolute",
    top: "-12px",
    right: "-28px"
  }
}));

const thumbsContainer = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 16
};

const thumb = {
  display: "inline-flex",
  position: "relative",
  borderRadius: 2,
  border: "3px solid #eaeaea",
  marginBottom: 8,
  marginRight: 4,
  width: 150,
  height: 150,
  padding: 4,
  boxSizing: "border-box",
  margin: "0 auto"
};

const thumbInner = {
  display: "flex",
  minWidth: 0,
  overflow: "hidden"
};

const img = {
  display: "block",
  width: "auto",
  height: "100%"
};

function Previews(props) {
  const classes = useStyles();
  //const [imageData, setDataImage] = useState([""]);
  const [files, setFiles] = useState([]);
  const dispatch = useDispatch();
  const addImage = files => dispatch(addImageAction(files));
  const deleteImage = files => dispatch(deleteImageAction(files));
  const clearStoreImage = files => dispatch(clearAction(files));

  const removeImage = imageIndex => {
    let array = [...files];
    if (imageIndex !== -1) {
      array = files.filter((_, index) => index !== imageIndex);
      //array.splice(imageIndex, 1);
      console.log(array);
      setFiles(array);
      deleteImage(null, imageIndex);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: acceptedFiles => {
      setFiles([""]);
      clearStoreImage(clearAction);
      setFiles(
        acceptedFiles.map(file =>
          Object.assign(file, {
            id: uuid(),
            preview: URL.createObjectURL(file)
          })
        )
      );
      addImage({
        name: acceptedFiles.map(file => file)
      });
    }
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
    () => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach(file => URL.revokeObjectURL(file.preview));
    },
    [] //files
  );

  const handleChangeMulter = e => {
    let imageFormObj = new FormData();
    //setDisabled({ value: false });
    for (var x = 0; x < e.target.files.length; x++) {
      imageFormObj.append(
        "imageName",
        "multer-image-" + e.target.files[x].name
      );

      imageFormObj.append("imageData", e.target.files[x]);
      // store a readable instance of
      // the image being uploaded using multer
    }
    let imgData = imageFormObj.get("imageData");

    setFiles({
      imageData: imgData
    });
  };

  const onSubmit = event => {
    event.preventDefault();
    addImage({
      id: uuid(),
      name: files
    });
    setFiles("");
  };

  const handleChange = event => {
    setFiles(event.target.value);
  };

  return (
    <section>
      <div {...getRootProps({ className: "dropzone" })}>
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
    </section>
  );
}

export default Previews;
