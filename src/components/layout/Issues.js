import React, { useState, useEffect, Suspense } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import issueService from '../../services/issueService';
import '../../App.css';
import moment from 'moment';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Redirect, Link } from 'react-router-dom';
import MaterialTable from 'material-table';
import CircularProgress from '@material-ui/core/CircularProgress';
const formattedDate = (value) => moment(value).format('DD/MM-YYYY');

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  content: {
    flexGrow: 1,
    paddingTop: '65px',
    paddingLeft: '5px',
  },
  colorPrimary: {
    backgroundImage:
      'linear-gradient(rgb(15, 76, 129) 0%, rgb(6, 80, 249) 100%)',
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
    borderRadius: '.25em',
  },
}));

export default function Issues(props) {
  const classes = useStyles();
  const [dataset, setData] = useState([]);

  const [state] = useState({
    columns: [
      {
        title: 'Prioritet',
        field: 'priority',
        width: 20,
        render: (data) => (
          <div
            className="priority"
            style={{
              color:
                data.priority === 'Øyeblikkelig'
                  ? 'darkred'
                  : '' || data.priority === 'Høy'
                  ? 'orange'
                  : '' || data.priority === 'Normal'
                  ? 'white'
                  : '' || data.priority === 'Haster'
                  ? 'yellow'
                  : '' || data.priority === 'Lav'
                  ? 'grey'
                  : '',
            }}
          >
            {data.priority}
          </div>
        ),
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
        ),
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
                  ? 'white'
                  : '' || data.status === 'Lukket'
                  ? 'gray'
                  : '',
            }}
          >
            {data.status}
          </div>
        ),
      },
      {
        title: 'Oppdatert',
        width: 20,
        field: 'updatedAt',
        render: (data) => <div>{formattedDate(data.updatedAt)}</div>,
      },
    ],
  });

  useEffect(() => {
    getIssues();
  }, [!dataset]);

  const getIssues = async () => {
    let res = await issueService.getAll();
    setData(res);
  };

  function MaterialCustomTable() {
    return (
      <MaterialTable
        options={{
          headerStyle: {
            backgroundImage:
              'linear-gradient(rgb(15, 76, 129) 0%, rgb(44, 28, 58) 100%)',
            color: '#FFF',
            textAlign: 'left',
          },
          rowStyle: {
            boxShadow: '0 6px 12px rgba(51, 51, 51, 0.1)',
          },
          search: true,
          exportButton: true,
          pageSize: 10,
          loadingType: 'linear',
          tableLayout: 'auto',
          columnsButton: true,
        }}
        title="Registrerte saker"
        columns={state.columns}
        data={dataset}
      />
    );
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
  );
}
