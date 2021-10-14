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

import highest from "../../images/highest.svg";
import high from "../../images/high.svg";
import medium from "../../images/medium.svg";
import low from "../../images/low.svg";
import lowest from "../../images/lowest.svg";

const formattedDate = (value) => moment(value).format("DD MMM YYYY");

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
    margin: "2rem",
  },
  statusImg: {
    width: "20px",
    height: "20px",
    verticalAlign: "text-bottom",
    paddingRight: "5px",
  },
  colorPrimary: {
    backgroundImage:
      "linear-gradient(rgb(15, 76, 129) 0%, rgb(6, 80, 249) 100%)",
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
      {
        title: "Oppsummering",
        field: "summary",
        render: (data) => (
          <span>
            <Link to={"/vis-sak/" + data._id} className="link underline">
              {data.summary}
            </Link>
          </span>
        ),
        cellStyle: {
          width: 650,
          maxWidth: 650,
        },
        headerStyle: {
          width: 650,
          maxWidth: 650,
        },
      },
      { title: "Kategori", field: "category", headerStyle: { width: "6.66%" } },
      {
        title: "Alvorlighetsgrad",
        field: "severity",
        headerStyle: { width: "6.66%" },
      },
      {
        title: "Lagt inn",
        defaultSort: "desc",
        field: "createdAt",
        render: (data) => <div>{formattedDate(data.createdAt)}</div>,
        headerStyle: { width: "16.66%" },
      },
      {
        title: "Prioritet",
        field: "priority",
        // eslint-disable-next-line react/display-name
        render: (
          data //url(./img/pattern6.webp)
        ) => (
          <div
            className="priority"
            style={{
              fontSize: "1em",
              fontWeight: "600",
              padding: "0.7em",
            }}
          >
            {data.priority === "Øyeblikkelig" ? (
              <img className={classes.statusImg} src={highest}></img>
            ) : "" || data.priority === "Høy" ? (
              <img className={classes.statusImg} src={high}></img>
            ) : "" || data.priority === "Normal" ? (
              <img className={classes.statusImg} src={medium}></img>
            ) : "" || data.priority === "Haster" ? (
              <img className={classes.statusImg} src={low}></img>
            ) : "" || data.priority === "Lav" ? (
              <img className={classes.statusImg} src={lowest}></img>
            ) : (
              ""
            )}
            {data.priority}
          </div>
        ),
        headerStyle: { width: "16.66%" },
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
              textShadow:
                "rgb(0 0 0 / 41%) 1px 1px 2px, rgb(255 255 255 / 8%) 0px -5px 10px",
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
            {data.status === "Åpen" ?
              "🔓 Åpen"
              : "" || data.status === "Løst" ?
              "✅ Løst"
              : "" || data.status === "Lukket" ?
              "🔐 Lukket"
              : "" || data.status === "Under arbeid" ?
              "👷 Under arbeid"
              : ""}
          </div>
        ),
        headerStyle: { width: "16.66%" },
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
    const jwt = auth.isAuthenticated();

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
              return { backgroundColor: "#50C252" };
            }
          },
          filterCellStyle: {
            background: "rgb(255 255 255)",
          },
          padding: "dense",
          exportAllData: true,
          headerStyle: {
            backgroundColor: "#FFFFFF",
            color: "#000000",
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
          resizable: true,
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
