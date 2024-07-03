import React, { useState, useEffect } from 'react'
import { makeStyles } from '@mui/styles'
import issueService from '../../services/issueService'
import '../../App.css'
import moment from 'moment'
import CssBaseline from '@mui/material/CssBaseline'
import Grid from '@mui/material/Grid'
import { Link } from 'react-router-dom'
import MaterialTable from '@material-table/core'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Fade from '@mui/material/Fade'
import auth from '../auth/auth-helper'
import highest from '../../images/highest.svg'
import high from '../../images/high.svg'
import medium from '../../images/medium.svg'
import low from '../../images/low.svg'
import lowest from '../../images/lowest.svg'
import { useQuery } from 'react-query'

const formattedDate = (value) => moment(value).format('DD MMM YYYY')

const drawerWidth = 240

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    drawer: {
        [theme.breakpoints.up('xs')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    content: {
        flexGrow: 1,
        paddingTop: '65px',
        marginLeft: '1.2rem',
    },
    statusImg: {
        width: '20px',
        height: '20px',
        verticalAlign: 'text-bottom',
        paddingRight: '5px',
    },
    colorPrimary: {
        backgroundImage: 'linear-gradient(rgb(15, 76, 129) 0%, rgb(6, 80, 249) 100%)',
    },
    alignItemsAndJustifyContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing(2),
    },
    paginationToolbar: {
        justifyContent: 'center',
    },
}))

export default function Issues(props) {
    const classes = useStyles()
    const [page, setPage] = useState(0) // Note that page is 0-based
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const fetchIssues = async ({ queryKey }) => {
        const [_key, { page, rowsPerPage }] = queryKey
        const jwt = auth.isAuthenticated()
        const res = await issueService.getAll(jwt.token, page + 1, rowsPerPage) // API page is 1-based
        return res
    }

    const { data, error, isLoading } = useQuery(['issues', { page, rowsPerPage }], fetchIssues, {
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
        cacheTime: 10 * 60 * 1000, // Data is cached for 10 minutes
        refetchOnWindowFocus: true, // Refetch on window focus
        refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    })

    useEffect(() => {
        if (data && data.totalPages && page >= data.totalPages) {
            setPage(data.totalPages - 1)
        }
    }, [data, page])

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event) => {
        const newRowsPerPage = parseInt(event.target.value, 10)
        setRowsPerPage(newRowsPerPage)
        setPage(0) // Reset to first page when changing rows per page
    }

    const issueCircularLoader = () => (
        <Grid container spacing={0} alignItems="center" justifyContent="center" style={{ minHeight: '100vh' }}>
            <Grid item xs={6}>
                <Typography variant="h6" gutterBottom>
                    <CircularProgress /> Laster inn saker...
                </Typography>
            </Grid>
        </Grid>
    )

    if (isLoading) {
        return issueCircularLoader()
    }

    if (error) {
        return <div>Error: {error.message}</div>
    }

    const columns = [
        {
            title: 'Oppsummering',
            field: 'summary',
            render: (data) => (
                <span>
                    <Link to={'/vis-sak/' + data._id} className="link underline">
                        {data.summary}
                    </Link>
                </span>
            ),
            cellStyle: {
                width: '40%',
                maxWidth: 650,
            },
            headerStyle: {
                width: '40%',
                maxWidth: 650,
            },
        },
        {
            title: 'Kategori',
            field: 'category',
            headerStyle: { width: '10%' },
        },
        {
            title: 'Alvorlighetsgrad',
            field: 'severity',
            headerStyle: { width: '10%' },
        },
        {
            title: 'Lagt inn',
            defaultSort: 'desc',
            field: 'createdAt',
            render: (data) => <div>{formattedDate(data.createdAt)}</div>,
            headerStyle: { width: '10%' },
        },
        {
            title: 'Prioritet',
            field: 'priority',
            render: (data) => (
                <div
                    className="priority"
                    style={{
                        fontSize: '1em',
                        fontWeight: '600',
                        padding: '0.7em',
                    }}
                >
                    {data.priority === 'Øyeblikkelig' ? (
                        <img className={classes.statusImg} src={highest} alt="Highest" />
                    ) : data.priority === 'Høy' ? (
                        <img className={classes.statusImg} src={high} alt="High" />
                    ) : data.priority === 'Normal' ? (
                        <img className={classes.statusImg} src={medium} alt="Medium" />
                    ) : data.priority === 'Haster' ? (
                        <img className={classes.statusImg} src={low} alt="Low" />
                    ) : data.priority === 'Lav' ? (
                        <img className={classes.statusImg} src={lowest} alt="Lowest" />
                    ) : (
                        ''
                    )}
                    {data.priority}
                </div>
            ),
            headerStyle: { width: '10%' },
        },
        {
            title: 'Status',
            field: 'status',
            render: (data) => (
                <div
                    className="status"
                    style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#ffffff',
                        textShadow: 'rgb(0 0 0 / 41%) 1px 1px 2px, rgb(255 255 255 / 8%) 0px -5px 10px',
                        backgroundColor:
                            data.status === 'Åpen'
                                ? 'rgb(155, 119, 255)'
                                : data.status === 'Løst'
                                ? 'rgb(87, 242, 80)'
                                : data.status === 'Lukket'
                                ? 'rgb(255, 65, 55)'
                                : data.status === 'Under arbeid'
                                ? 'rgb(202, 163, 0)'
                                : '',
                        padding: '0.7em',
                    }}
                >
                    {data.status === 'Åpen'
                        ? '🔓 Åpen'
                        : data.status === 'Løst'
                        ? '✅ Løst'
                        : data.status === 'Lukket'
                        ? '🔐 Lukket'
                        : data.status === 'Under arbeid'
                        ? '👷 Aktiv'
                        : ''}
                </div>
            ),
            headerStyle: { width: '10%' },
        },
    ]

    return (
        <div className={classes.root}>
            <CssBaseline />
            <nav className={classes.drawer} aria-label="Registrerte Saker" />
            {isLoading ? (
                issueCircularLoader()
            ) : (
                <Fade in={!isLoading}>
                    <main className={classes.content}>
                        <MaterialTable
                            localization={{
                                body: {
                                    emptyDataSourceMessage: 'Ingen saker funnet',
                                    filterRow: {
                                        filterTooltip: 'Filter',
                                    },
                                },
                                toolbar: {
                                    searchPlaceholder: 'Søk',
                                    showColumnsTitle: 'Kolonne',
                                    addRemoveColumns: 'Legg til eller fjern kolonner',
                                    exportTitle: 'Eksporter',
                                },
                                pagination: {
                                    labelDisplayedRows: '{from}-{to} av {count}',
                                    nextTooltip: 'Neste side',
                                    previousTooltip: 'Forrige side',
                                    lastTooltip: 'Siste side',
                                    firstTooltip: 'Første side',
                                },
                            }}
                            options={{
                                paging: true,
                                pageSize: rowsPerPage,
                                pageSizeOptions: [5, 10, 20, 30, 40, 50, 100],
                                rowStyle: (x) => (x.tableData.id % 1 ? { backgroundColor: '#50C252' } : {}),
                                filterCellStyle: {
                                    background: 'rgb(255 255 255)',
                                },
                                padding: 'normal',
                                exportAllData: true,
                                headerStyle: {
                                    backgroundColor: '#FFFFFF',
                                    color: '#000000',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap',
                                },
                                filtering: true,
                                search: true,
                                exportButton: true,
                                loadingType: 'overlay',
                                debounceInterval: 500,
                                columnsButton: true,
                                resizable: true,
                            }}
                            title="Registrerte saker"
                            columns={columns}
                            data={data.data.map((row, index) => ({ ...row, id: row._id || index }))}
                            components={{
                                Pagination: (props) => (
                                    <TablePagination
                                        {...props}
                                        component="div"
                                        count={data.totalItems}
                                        page={page}
                                        onPageChange={handleChangePage}
                                        rowsPerPage={rowsPerPage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                        className={classes.pagination}
                                        classes={{ toolbar: classes.paginationToolbar }}
                                    />
                                ),
                            }}
                            actions={[
                                {
                                    icon: 'add_box',
                                    tooltip: 'Legg til ny sak',
                                    position: 'toolbar',
                                    onClick: () => {
                                        props.history.push('/legg-til-sak/' + data.id)
                                    },
                                },
                            ]}
                        />
                    </main>
                </Fade>
            )}
        </div>
    )
}
