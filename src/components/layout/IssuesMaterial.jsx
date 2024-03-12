import React, { useState, useEffect } from 'react'
import { withStyles, makeStyles } from '@mui/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import issueService from '../../services/issueService'
import auth from '../auth/auth-helper'
import '../../App.css'
import moment from 'moment'

const formattedDate = (value) => moment(value).format('DD/MM-YYYY HH:SS')

const columns = [
    { id: 'priority', label: 'Prioritet', minWidth: 35, align: 'left' },
    { id: '_id', label: 'ID', minWidth: 20 },
    {
        id: 'kommentar',
        label: 'Kommentarer',
        minWidth: 20,
        width: 20,
        align: 'left',
        format: (value) => value.toLocaleString(),
    },
    {
        id: 'category',
        label: 'Kategori',
        minWidth: 20,
        align: 'left',
        format: (value) => value.toLocaleString(),
    },
    {
        id: 'severity',
        label: 'Alvorlighetsgrad',
        minWidth: 60,
        align: 'center',
        format: (value) => value.toLocaleString(),
    },
    {
        id: 'status',
        label: 'Status',
        minWidth: 50,
        align: 'left',
        format: (value) => value.toLocaleString(),
    },
    {
        id: 'updatedAt',
        label: 'Oppdatert',
        minWidth: 120,
        align: 'left',
        format: (value) => formattedDate(value),
    },
    {
        id: 'summary',
        label: 'Oppsummering',
        minWidth: 50,
        align: 'left',
        format: (value) => value.toLocaleString(),
    },
]

const StyledTableCell = withStyles((theme) => ({
    head: {
        backgroundColor: '#712e5e',
        // width: 1700,
        fontFamily: 'Nunito',
        fontWeight: 700,
        color: theme.palette.common.white,
        fontSize: 16,
        lineHeight: '1.0rem',
    },
    body: {
        fontSize: 14,
        fontFamily: 'Nunito',
    },
}))(TableCell)

const StyledTableRow = withStyles((theme) => ({
    root: {
        fontSize: 12,
        fontFamily: 'Nunito',
        '&:nth-of-type(odd)': {
            backgroundColor: '#6d004c21',
        },
    },
    body: {
        fontSize: 12,
        fontFamily: 'Nunito',
    },
}))(TableRow)

const useStyles = makeStyles((theme) => ({
    root: {
        width: '70%',
        marginTop: theme.spacing(12),
        marginLeft: 290,
        overflowX: 'auto',
        borderRadius: 14,
    },
    table: {
        minWidth: 500,
    },
    tableWrapper: {
        maxHeight: 900,
        overflow: 'auto',
    },
    label: {
        display: 'inline',
        padding: '.2em .6em .3em',
        fontSize: '75%',
        fontWeight: 700,
        lineHeight: 1,
        backgroundColor: 'lightblue',
        color: '#000',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        verticalAlign: 'baseline',
        borderRadius: '.25em',
    },
}))

export default function Issues(props) {
    const classes = useStyles()
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [dataset, setData] = useState([])

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value)
        setPage(0)
    }

    useEffect(() => {
        getIssues()
    }, [!dataset])

    const getIssues = async () => {
        const jwt = auth.isAuthenticated()

        const res = await issueService.getAll(jwt.token)
        setData(res)
    }

    const renderIssues = (issues) => {
        const value = issues[columns.id]
        return (
            <TableCell style={{ minWidth: columns.minWidth }} key={issues._id} align={columns.align}>
                {dataset && dataset.length > 0 ? (
                    dataset.map((dataset) => renderIssues(dataset))
                ) : (
                    <p>Ingen saker registrert.</p>
                )}
            </TableCell>
        )
    }

    return (
        <Paper className={classes.root}>
            <div className={classes.tableWrapper}>
                <React.Fragment>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={dataset.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        backIconButtonProps={{
                            'aria-label': 'previous page',
                        }}
                        nextIconButtonProps={{
                            'aria-label': 'next page',
                        }}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <StyledTableCell
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        {column.label}
                                    </StyledTableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {dataset.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                                return (
                                    <StyledTableRow hover role="checkbox" tabIndex={-1} key={index}>
                                        {columns.map((column, index) => {
                                            const value = row[column.id]
                                            return (
                                                <TableCell
                                                    style={{ fontWeight: 500, fontSize: '1.2em' }}
                                                    key={index}
                                                    align={column.align}
                                                >
                                                    {column.format && typeof value === 'string'
                                                        ? column.format(value)
                                                        : value}
                                                </TableCell>
                                            )
                                        })}
                                    </StyledTableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={dataset.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        backIconButtonProps={{
                            'aria-label': 'previous page',
                        }}
                        nextIconButtonProps={{
                            'aria-label': 'next page',
                        }}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </React.Fragment>
            </div>
        </Paper>
    )
}
