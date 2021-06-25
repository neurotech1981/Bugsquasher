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
  label: {
    display: "inline",
    padding: ".5em .6em .3em",
    fontSize: "50%",
    fontWeight: 700,
    lineHeight: 1,
    backgroundColor: "lightblue",
    color: "#000",
    textAlign: "center",
    whiteSpace: "nowrap",
    verticalAlign: "baseline",
    borderRadius: ".25em",
  },
}));

export default function Issues() {
  const classes = useStyles();
  const [dataset, setData] = useState([]);
  const [checked, setChecked] = useState(false);

  const [state] = useState({
    columns: [
      {
        title: "Prioritet",
        field: "priority",
        width: 20,
        // eslint-disable-next-line react/display-name
        render: (data) => (
          <div
            className="priority"
            style={{
              height: "100%",
              width: "100",
              fontSize: "1.1em",
              fontWeight: "600",
              backgroundColor:
                data.priority === "Øyeblikkelig" ?
                  "rgb(255, 185, 145)"
                  : "" || data.priority === "Høy" ?
                  "rgb(242, 130, 91)"
                  : "" || data.priority === "Normal" ?
                  "rgb(206, 255, 204)"
                  : "" || data.priority === "Haster" ?
                  "rgb(231, 242, 163)"
                  : "" || data.priority === "Lav" ?
                  "rgb(211, 212, 242)"
                  : "",
              padding: "0.2em",
            }}
          >
            {data.priority}
          </div>
        ),
      },
      {
        title: "ID",
        field: "_id",
        width: 20,
        type: "numeric",
        render: (data) => (
          <span>
            <Link to={"/vis-sak/" + data._id} className="link underline">
              {data._id}
            </Link>
          </span>
        ),
      },
      { title: "Oppsummering", field: "summary" },
      { title: "Kategori", field: "category" },
      { title: "Alvorlighetsgrad", field: "severity", width: 30 },
      {
        title: "Status",
        field: "status",
        render: (data) => (
          <div
            className="status"
            style={{
              fontSize: "1.1em",
              fontWeight: "600",
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
              padding: "0.2em",
            }}
          >
            {data.status}
          </div>
        ),
      },
      {
        title: "Opprettet",
        width: 20,
        defaultSort: "desc",
        field: "createdAt",
        render: (data) => <div>{formattedDate(data.createdAt)}</div>,
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
    const res = await issueService.getAll();
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
            if (x.tableData.id % 2) {
              return { backgroundColor: "#f2f2f2" };
            }
          },
          filterCellStyle: {
            background: "#f2f2f2",
          },
          padding: "dense",
          exportAllData: true,
          headerStyle: {
            backgroundColor: "#05386B",
            color: "#FFF",
            textAlign: "left",
            fontWeight: "700",
            whiteSpace: "nowrap",
          },
          filtering: true,
          search: true,
          exportButton: true,
          pageSize: 10,
          loadingType: "overlay",
          isLoading: true,
          debounceInterval: 500,
          tableLayout: "auto",
          columnsButton: true,
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
