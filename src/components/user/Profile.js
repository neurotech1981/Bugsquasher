import React, { Component, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import useReactRouter from 'use-react-router';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Person from '@material-ui/icons/Person';
import Divider from '@material-ui/core/Divider';
import auth from '../auth/auth-helper';
import { findUserProfile } from '../utils/api-user';
import { Redirect, Link } from 'react-router-dom';

import DeleteUser from './DeleteUser';

const useStyles = makeStyles(theme => ({
	root: theme.mixins.gutters({
		maxWidth: 600,
		margin: 'auto',
		padding: theme.spacing.unit * 3,
		marginTop: theme.spacing.unit * 5
	}),
	title: {
		margin: `${theme.spacing.unit * 3}px 0 ${theme.spacing.unit * 2}px`,
		color: theme.palette.protectedTitle
	}
}));

export default function Profile(props) {  
  const { history, location, match } = useReactRouter();
	const state = {
			user: '',
			redirectToSignin: false
    };
    
  const [values, setValues] = useState(state);

    const init = userId => {
		const jwt = auth.isAuthenticated();
		findUserProfile(
			{
				userId: userId
			},
			{ t: jwt.token }
		).then(data => {
			if (data.error) {
				setValues({ redirectToSignin: true });
			} else {
				setValues({ user: data });
			}
		});
  };

  useEffect(() => {
			init(match.params.userId);
  }, []);

  const classes = useStyles();

		if (!auth.isAuthenticated().user || values.redirectToSignin) {
			return <Redirect to="/signin" />;
		}
		return (
			<Paper className={classes.root} elevation={4}>
				<Typography type="title" className={classes.title}>
					Profile
				</Typography>
				<List dense>
					<ListItem>
						<ListItemAvatar>
							<Avatar>
								<Person />
							</Avatar>
						</ListItemAvatar>
						<ListItemText
							primary={values.user.name}
							secondary={values.email}
						/> {auth.isAuthenticated().user &&
							auth.isAuthenticated().user._id == values.user._id && (
								<ListItemSecondaryAction>
									<DeleteUser userId={values.user._id} />
								</ListItemSecondaryAction>
							)}
					</ListItem>
					<Divider />
				</List>
			</Paper>
		);
	}