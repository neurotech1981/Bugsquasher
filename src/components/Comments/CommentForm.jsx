import React, { useEffect } from 'react'
import TextField from '@material-ui/core/TextField'
import { useForm, Controller } from 'react-hook-form'
import { Typography, Snackbar, Button, makeStyles } from '@material-ui/core'
import MuiAlert from '@material-ui/lab/Alert'
import { AlertTitle } from '@material-ui/lab'

function Alert(props) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <MuiAlert elevation={1} variant="filled" {...props} />
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'left',
    alignItems: 'left',
    padding: theme.spacing(0),
    '& .MuiTextField-root': {
      margin: theme.spacing(0),
      width: '100%  ',
    },
    '& .MuiButtonBase-root': {
      margin: theme.spacing(0),
    },
  },
  commentField: {
    minWidth: '50%',
    backgroundColor: 'white',
  },
  commentFieldBtn: {
    minWidth: '50%',
    marginTop: '1rem',
  },
}))

const CommentForm = ({ onSubmit, openNewComment, setOpenNewComment }) => {
  const classes = useStyles()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { content: '' },
  })

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenNewComment(false)
  }

  const SuccessAlert = () => (
    <Snackbar open={open} autohideduration={3000} onClose={handleClose}>
      <Alert elevation={0} onClose={handleClose} severity="success" variant="filled">
        <AlertTitle>Ny kommentar</AlertTitle>
        Kommentaren din ble lagt til.
      </Alert>
    </Snackbar>
  )

  useEffect(() => {
    reset({ content: '' })
  }, [reset, onSubmit])

  return (
    <>
      <form className={classes.root} onSubmit={handleSubmit(onSubmit)}>
        <Typography component={'span'} variant={'body1'}>
          Ny kommentar
        </Typography>
        <Controller
          name={'content'}
          control={control}
          defaultValue=""
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <TextField
                {...register('content', { required: true, maxLength: 150 })}
                label="Skriv inn din kommentar her"
                variant="outlined"
                className={classes.commentField}
                value={value}
                onChange={onChange}
                error={!!error}
                helperText={error ? error.message : null}
                type="text"
                multiline
                placeholder="Kommentar"
                minRows={5}
              />
              {errors.content?.type === 'required' && 'Kommentarfelt er tomt'}
              {errors.content?.type === 'maxLength' && 'Det er ikke tillatt med mer en 150 bokstaver'}
            </>
          )}
          rules={{ required: 'Du glemte å legge inn din kommentar' }}
        />
        {openNewComment && <SuccessAlert />}
        <div className={classes.commentFieldBtn}>
          <Button type="submit" variant="contained" color="primary">
            Send inn
          </Button>
        </div>
      </form>
    </>
  )
}

export default CommentForm
