import React from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

//const useStyles = makeStyles(styles);
const useStyles = makeStyles((styles) => ({
  //const styles =  {
  grid: {
    width: '100%',
    marginRight: '100px !important',
    marginTop: '16px !important',
    margin: '0 auto',
    [styles.breakpoints.up('sm')]: {
      width: '80%',
      marginRight: '100px !important',
      marginTop: '16px !important',
      margin: '0 auto',
    },
  },
}))

export default function GridContainer(props) {
  const classes = useStyles();
  const { children, ...rest } = props;
  return (
    <Grid container {...rest} className={classes.grid}>
      {children}
    </Grid>
  );
}

GridContainer.propTypes = {
  children: PropTypes.node,
};
