/* eslint-disable react/display-name */
import React, { useState, useEffect, Suspense } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import issueService from '../../services/issueService'
import '../../App.css'
import moment from 'moment'
import CssBaseline from '@material-ui/core/CssBaseline'
import { Link } from 'react-router-dom'
import MaterialTable from 'material-table'
import CircularProgress from '@material-ui/core/CircularProgress'
const formattedDate = (value) => moment(value).format('DD/MM-YYYY')

const drawerWidth = 240

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex'
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0
    }
  },
  content: {
    flexGrow: 1,
    paddingTop: '65px',
    paddingLeft: '5px'
  },
  colorPrimary: {
    //backgroundImage:
    //  'linear-gradient(rgb(15, 76, 129) 0%, rgb(6, 80, 249) 100%)'
    backgroundColor: '#48305F'
  },
  label: {
    display: 'inline',
    padding: '.5em .6em .3em',
    fontSize: '50%',
    fontWeight: 700,
    lineHeight: 1,
    backgroundColor: 'lightblue',
    color: '#000',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    verticalAlign: 'baseline',
    borderRadius: '.25em'
  }
}))

export default function Issues (props) {
  const classes = useStyles()
  const [dataset, setData] = useState([])

  const [state] = useState({
    columns: [
      {
        title: 'Prioritet',
        field: 'priority',
        width: 20,
        // eslint-disable-next-line react/display-name
        render: (data) => (
          <div
            className="priority"
            style={{
              color:
                data.priority === 'Øyeblikkelig'
                  ? 'rgb(255, 125, 145)'
                  : '' || data.priority === 'Høy'
                    ? 'orange'
                    : '' || data.priority === 'Normal'
                      ? 'white'
                      : '' || data.priority === 'Haster'
                        ? 'yellow'
                        : '' || data.priority === 'Lav'
                          ? 'grey'
                          : '',
                padding: '0.7em'
            }}
          >
            {data.priority}
          </div>
        )
      },
      {
        title: 'ID',
        field: '_id',
        width: 20,
        type: 'numeric',
        render: (data) => (
          <span>
            <Link to={'/vis-sak/' + data._id} className="link underline">
              {data._id}
            </Link>
          </span>
        )
      },
      { title: 'Oppsummering', field: 'summary' },
      { title: 'Kategori', field: 'category' },
      { title: 'Alvorlighetsgrad', field: 'severity', width: 30 },
      {
        title: 'Status',
        field: 'status',
        render: (data) => (
          <div
            className="status"
            style={{
              color:
                data.status === 'Åpen'
                  ? 'rgb(255, 199, 255)'
                  : '' || data.status === 'Løst'
                    ? 'rgb(255, 255, 145)'
                    : '' || data.status === 'Lukket'
                    ? 'rgb(255, 125, 145)'
                    : '',
            }}
          >
            {data.status}
          </div>
        )
      },
      {
        title: 'Opprettet',
        width: 20,
        field: 'createdAt',
        render: (data) => <div>{formattedDate(data.createdAt)}</div>
      }
    ]
  })

  useEffect(() => {
    let isSubscribed = true

    if (!dataset.length) {
        if (isSubscribed) {
          getIssues()
        }
    }
    return () => isSubscribed = false
  }, [dataset])

  const getIssues = async () => {
    const res = await issueService.getAll()
    setData(res)
  }

  function MaterialCustomTable () {
    return (
      <MaterialTable
        options={{
          headerStyle: {
            backgroundColor: '#2C1C3A',
            color: '#FFF',
            textAlign: 'left',
          },
          rowStyle: {
            boxShadow: '0 6px 12px rgba(51, 51, 51, 0.1)'
          },
          search: true,
          exportButton: true,
          pageSize: 10,
          loadingType: 'linear',
          tableLayout: 'auto',
          columnsButton: true
        }}
        title="Registrerte saker"
        columns={state.columns}
        data={dataset}
      />
    )
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <nav className={classes.drawer} aria-label="Mailbox folders" />
      <main className={classes.content}>
        <React.Fragment>
          <Suspense fallback={<CircularProgress />}>
            <MaterialCustomTable />
          </Suspense>
        </React.Fragment>
      </main>
    </div>
  )
}
