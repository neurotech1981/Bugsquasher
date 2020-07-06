import React, { Component, useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core//Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogContent from '@material-ui/core/DialogContent';
import Dialog from '@material-ui/core/Dialog';
import Delete from '@material-ui/icons/Delete';
import auth from '../auth/auth-helper';
import { deleteUser } from '../utils/api-user';
import { Redirect, Link } from 'react-router-dom';

export default function DeleteUser(props) {

	const initialState = {
		redirect: false,
		open: false
  };
  
  const [values, setValues] = useState(initialState);

	const clickButton = () => {
		setValues({ open: true });
  };
  
	const deleteAccount = () => {
		const jwt = auth.isAuthenticated();
		deleteUser(
			{
				userId: props.userId
			},
			{ t: jwt.token }
		).then(data => {
			if (data.error) {
				console.log(data.error);
			} else {
				auth.signout(() => console.log('deleted'));
				setValues({ redirect: true });
			}
		});
  };
  
	const handleRequestClose = () => {
		setValues({ open: false });
	};

		const redirect = values.redirect;
		if (redirect) {
			return <Redirect to="/" />;
		}
		return (
			<span>
				<IconButton
					aria-label="Delete"
					onClick={e => clickButton()}
					color="secondary"
				>
					<Delete />
				</IconButton>

				<Dialog open={values.open} onClose={e => handleRequestClose()}>
					<DialogTitle>{'Delete Account'}</DialogTitle>
					<DialogContent>
						<DialogContentText>
							Confirm to delete your account.
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button onClick={e => handleRequestClose()} color="primary">
							Cancel
						</Button>
						<Button
							onClick={e => deleteAccount()}
							color="secondary"
							autoFocus="autoFocus"
						>
							Confirm
						</Button>
					</DialogActions>
				</Dialog>
			</span>
		);
	}