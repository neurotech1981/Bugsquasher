/* eslint-disable react/display-name */
import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import issueService from "../../services/issueService";
import "../../App.css";
import moment from "moment";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import { Link } from "react-router-dom";
import MaterialTable from "material-table";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import Fade from "@material-ui/core/Fade";
import auth from "../auth/auth-helper";

const formattedDate = (value) => moment(value).format("DD/MM-YYYY HH:mm");

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  content: {
    flexGrow: 1,
    paddingTop: "65px",
    paddingLeft: "5px",
  },
  colorPrimary: {
    backgroundImage:
      'linear-gradient(rgb(15, 76, 129) 0%, rgb(6, 80, 249) 100%)'
    //backgroundColor: "#48305F",
  },
  alignItemsAndJustifyContent: {
    alignItems: "center",
    justifyContent: "center",
  },
}));

export default function Issues() {
  const classes = useStyles();
  const [dataset, setData] = useState([]);
  const [checked, setChecked] = useState(false);

  const [state] = useState({
    columns: [
      { title: "Oppsummering", field: "summary",
      render: (data) => (
        <span>
          <Link to={"/vis-sak/" + data._id} className="link underline">
            {data.summary}
          </Link>
        </span>
      ),
      cellStyle: {
        width: 650,
        maxWidth: 650
      },
      headerStyle: {
        width:650,
        maxWidth: 650
      }
    },
      { title: "Kategori", field: "category", headerStyle: {width: "6.66%"} },
      { title: "Alvorlighetsgrad", field: "severity", headerStyle: {width: "6.66%"} },
      {
        title: "Lagt inn",
        defaultSort: "desc",
        field: "createdAt",
        render: (data) => <div>{formattedDate(data.createdAt)}</div>,
        headerStyle: {width: "16.66%"}
      },
      {
        title: "Prioritet",
        field: "priority",
        // eslint-disable-next-line react/display-name
        render: (data) => (
          <div
            className="priority"
            style={{
              fontSize: "1em",
              fontWeight: "600",
              textShadow: "2px 4px 4px rgba(0,0,0,0.2), 0px -5px 10px rgba(255,255,255,0.15)",
              color: "#ffffff",
              backgroundColor:
                data.priority === "Øyeblikkelig" ?
                  "rgba(236, 4, 4, 1)"
                  : "" || data.priority === "Høy" ?
                  "rgba(226, 31, 28, 1)"
                  : "" || data.priority === "Normal" ?
                  "rgba(217, 57, 53, .6)"
                  : "" || data.priority === "Haster" ?
                  "rgba(207, 84, 77, 1)"
                  : "" || data.priority === "Lav" ?
                  "rgba(197, 111, 101, 0.5)"
                  : "",
              padding: "0.7em",
            }}
          >
            {data.priority}
          </div>
        ),
        headerStyle: {width: "16.66%"}
      },
      {
        title: "Status",
        field: "status",
        render: (data) => (
          <div
            className="status"
            style={{
              fontSize: "1em",
              fontWeight: "600",
              color: "#ffffff",
              textShadow: "2px 4px 4px rgba(0,0,0,0.2), 0px -5px 10px rgba(255,255,255,0.15)",
              backgroundColor:
                data.status === "Åpen" ?
                  "rgb(155, 119, 255)"
                  : "" || data.status === "Løst" ?
                  "rgb(87, 242, 80)"
                  : "" || data.status === "Lukket" ?
                  "rgb(255, 65, 55)"
                  : "" || data.status === "Under arbeid" ?
                  "rgb(202, 163, 0)"
                  : "",
              padding: "0.7em",
            }}
          >
            {data.status}
          </div>
        ),
        headerStyle: {width: "16.66%"}
      },
    ],
  });

  const issueCircularLoader = () => (
    <Grid
      container
      spacing={0}
      alignItems="center"
      justify="center"
      style={{ minHeight: "100vh" }}
    >
      <Grid item xs={6}>
        <Typography variant="h6" gutterBottom>
          <CircularProgress /> Laster inn saker...
        </Typography>
      </Grid>
    </Grid>
  );

  useEffect(() => {
    let isSubscribed = true;

    if (!dataset.length) {
      if (isSubscribed) {
        getIssues();
      }
    }
    return () => (isSubscribed = false);
  }, [dataset]);

  const getIssues = async () => {
    const jwt = auth.isAuthenticated()

    const res = await issueService.getAll(jwt.token);
    setData(res);
    setChecked(true);
  };

  function MaterialCustomTable() {
    return (
      <MaterialTable
        localization={{
          body: {
            emptyDataSourceMessage: "Ingen saker funnet",
            filterRow: {
              filterTooltip: "Filter",
            },
          },
          toolbar: {
            searchPlaceholder: "Søk",
            showColumnsTitle: "Kolonne",
            addRemoveColumns: "Legg til eller fjern kolonner",
            exportTitle: "Eksporter",
          },
          pagination: {
            labelDisplayedRows: "{from}-{to} av {count}",
            nextTooltip: "Neste side",
            previousTooltip: "Forrige side",
            lastTooltip: "Siste side",
            firstTooltip: "Første side",
            labelRowsSelect: "oppføringer",
          },
        }}
        options={{
          sorting: true,
          rowStyle: (x) => {
            if (x.tableData.id % 1) {
              return { backgroundColor: "#f2f2f2" };
            }
          },
          filterCellStyle: {
            background: "rgb(225 240 255)",
          },
          padding: "dense",
          exportAllData: true,
          headerStyle: {
            backgroundColor: "rgb(225 240 255)",
            //color: "#FFFFFF",
            textAlign: "left",
            fontWeight: "600",
            whiteSpace: "nowrap",
          },
          filtering: true,
          search: true,
          exportButton: true,
          pageSize: 15,
          loadingType: "overlay",
          isLoading: true,
          debounceInterval: 500,
          columnsButton: true,
          resizable: true
        }}
        title="Registrerte saker"
        columns={state.columns}
        data={dataset}
        actions={[
          {
            icon: "add_box",
            tooltip: "Legg til ny sak",
            position: "toolbar",
            onClick: () => {
              console.log("Link til ny sak.");
            },
          },
        ]}
      />
    );
  }
  if (dataset <= null) {
    return issueCircularLoader();
  }
  return (
    <div className={classes.root}>
      <CssBaseline />
      <nav className={classes.drawer} aria-label="Registrerte Saker" />
      <Fade in={checked}>
        <main className={classes.content}>
          <MaterialCustomTable />
        </main>
      </Fade>
    </div>
  );
}
