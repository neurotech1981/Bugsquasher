import React, { Component, useState } from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import { CardActions } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import { makeStyles } from '@material-ui/core/styles';
import auth from './auth-helper';
import { Redirect } from 'react-router-dom';
import { signin } from '../utils/api-auth';
import useReactRouter from 'use-react-router';
import VpnKeyIcon from '@material-ui/icons/VpnKey';


const useStyles = makeStyles(theme => ({
  root: {
    margin: "0 auto",
  },
  extendedIcon: {
    marginRight: theme.spacing(1)
  },
  card: {
		maxWidth: 600,
		margin: 'auto',
		textAlign: 'center',
		marginTop: theme.spacing.unit * 15,
		paddingBottom: theme.spacing.unit * 2
	},
	error: {
		verticalAlign: 'middle'
	},
	title: {
		marginTop: theme.spacing.unit * 2,
		color: theme.palette.openTitle
	},
	textField: {
		marginLeft: theme.spacing.unit,
		marginRight: theme.spacing.unit,
		width: 300
	},
	submit: {
		margin: 'auto',
		marginBottom: theme.spacing.unit * 2
	}
}));

export default function Signin() {
  const { history, location, match } = useReactRouter();
	const initialState = {
		email: '',
		password: '',
		error: '',
		redirectToReferrer: false
	};
  
  const [values, setValues] = useState(initialState);

	const clickSubmit = () => {
		const user = {
			email: values.email || undefined,
			password: values.password || undefined
		};

	  signin(user).then(data => {
			if (data.error) {
				setValues({ error: data.error });
			} else {
				auth.authenticate(data, () => {
					setValues({ redirectToReferrer: true });
				});
			}
		});
	};

	const handleChange = name => event => {
    setValues({
      ...values,
      [name]: event.target.value,
    });
  };
  
  	const classes = useStyles();


		const { from } = location.state || {
			from: {
				pathname: '/'
			}
		};
		if (values.redirectToReferrer) {
			return <Redirect to={from} />;
    }

		return (
			<Card className={classes.card}>
				<CardContent>
          <Typography type="headline" variant="h3" gutterBottom className={classes.title}>
            Logg inn
          </Typography>
					<TextField
						id="email"
						type="email"
						label="E-Post"
						className={classes.textField}
						value={values.email}
						onChange={handleChange('email')}
						margin="normal"
            variant="outlined"
					/>
					<br />
					<TextField
						id="password"
						type="password"
						label="Passord"
						className={classes.textField}
						value={values.password}
						onChange={handleChange('password')}
						margin="normal"
            variant="outlined"
					/>
					<br />{' '}
					{values.error && (
						<Typography component="p" color="error">
							<Icon color="error" className={classes.error}>
								error
							</Icon>
							{values.error}
						</Typography>
					)}
				</CardContent>
      <CardActions>
					<Button
            color="primary"
            variant="contained"
            size="large"
						onClick={e => clickSubmit()}
						className={classes.submit}
					>
          <VpnKeyIcon className={classes.extendedIcon} />
						Logg inn
					</Button>
				</CardActions>
			</Card>
		);
	}

//export default withStyles(styles)(Signin);