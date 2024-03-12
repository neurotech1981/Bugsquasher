import React, { useEffect } from 'react'
import TextField from '@mui/material/TextField'
import { useForm, Controller } from 'react-hook-form'
import { Typography, Snackbar, Button } from '@mui/material'
import { createStyles } from '@mui/styles'
import { AlertTitle } from '@mui/lab'
import Alert from '@mui/material/Alert'

const useStyles = createStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'left',
        alignItems: 'left',
        '& .MuiTextField-root': {
            width: '100%  ',
        },
        '& .MuiButtonBase-root': {},
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
        <Snackbar
            open={open}
            autoHideDuration={3000}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
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
            <form onSubmit={handleSubmit(onSubmit)}>
                <Typography component={'span'} variant={'body1'} paragraph>
                    Ny kommentar
                </Typography>
                <Controller
                    name={'content'}
                    control={control}
                    defaultValue=""
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <>
                            <TextField
                                sx={{ display: 'flex' }}
                                {...register('content', { required: true, maxLength: 150 })}
                                label="Skriv inn din kommentar her"
                                variant="outlined"
                                className={classes.commentField.toString()}
                                value={value}
                                onChange={onChange}
                                error={!!error}
                                helperText={error ? error.message : null}
                                type="text"
                                multiline
                                placeholder="Kommentar"
                                minRows={5}
                                margin="normal"
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
