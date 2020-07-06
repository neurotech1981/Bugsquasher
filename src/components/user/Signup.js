import React, { Component, useState } from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import { makeStyles } from '@material-ui/core/styles';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogContent from '@material-ui/core/DialogContent';
import Dialog from '@material-ui/core/Dialog';
import { Link } from 'react-router-dom';


import { registerUser } from '../utils/api-user.js';

const useStyles = makeStyles(theme => ({
	card: {
		maxWidth: 600,
		margin: 'auto',
		textAlign: 'center',
		marginTop: theme.spacing.unit * 15,
		paddingBottom: theme.spacing(2)
	},
	error: {
		verticalAlign: 'middle'
	},
	title: {
		marginTop: theme.spacing(2),
		color: theme.palette.openTitle
	},
	textField: {
		marginLeft: theme.spacing(2),
		marginRight: theme.spacing(2),
		width: 300
	},
	submit: {
		margin: 'auto',
		marginBottom: theme.spacing(2)
	}
}));

export default function Signup() {
	const initialState = {
		name: '',
		password: '',
		email: '',
		open: false,
		error: ''
	};

  const [values, setValues] = useState(initialState);

	const handleChange = name => event => {
    setValues({
      ...values,
      [name]: event.target.value,
    });
  };

	const clickSubmit = () => {
		const user = {
			name: values.name || undefined,
			email: values.email || undefined,
			password: values.password || undefined
		};
		registerUser(user).then(data => {
			if (data.error) {
				setValues({ error: data.error });
			} else {
				setValues({ error: '', open: true });
			}
		});
	};
	
	const classes = useStyles();

		return (
			<div>
				<Card className={classes.card}>
					<CardContent>
          <Typography type="headline" variant="h3" gutterBottom className={classes.title}>
            Registrer bruker
          </Typography>
					<TextField
						autocomplete="off"
						id="name"
						type="text"
						label="Navn"
						className={classes.textField}
						value={values.name}
						onChange={handleChange('name')}
						margin="normal"
            variant="outlined"
					/>
						<br />
					<TextField
						autocomplete="off"
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
						autocomplete="off"
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
							onClick={e => clickSubmit()}
							className={classes.submit}
						>
							Registrer bruker
						</Button>
					</CardActions>
				</Card>
				<Dialog open={values.open} disableBackdropClick={true}>
					<DialogTitle>Ny bruker</DialogTitle>
					<DialogContent>
						<DialogContentText>
							Ny bruker lagt til.
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Link to="/signin">
							<Button color="primary" variant="contained" autoFocus="autoFocus">
								Logg inn
							</Button>
						</Link>
					</DialogActions>
				</Dialog>
			</div>
		);
	}
