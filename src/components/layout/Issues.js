import React, { useState, useEffect } from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import issueService from "../../services/issueService";
import "../../App.css";
import moment from "moment";
import { Redirect, Link } from "react-router-dom";
import MaterialTable from "material-table";
const formattedDate = value => moment(value).format("DD/MM-YYYY");

const columns = [
  { id: "priority", label: "Prioritet", minWidth: 35, align: "left" },
  { id: "_id", label: "ID", minWidth: 20 },
  {
    id: "kommentar",
    label: "Kommentarer",
    minWidth: 20,
    width: 20,
    align: "left",
    format: value => value.toLocaleString()
  },
  {
    id: "category",
    label: "Kategori",
    minWidth: 20,
    align: "left",
    format: value => value.toLocaleString()
  },
  {
    id: "severity",
    label: "Alvorlighetsgrad",
    minWidth: 60,
    align: "center",
    format: value => value.toLocaleString()
  },
  {
    id: "status",
    label: "Status",
    minWidth: 50,
    align: "left",
    format: value => value.toLocaleString()
  },
  {
    id: "updatedAt",
    label: "Oppdatert",
    minWidth: 120,
    align: "left",
    format: value => formattedDate(value)
  },
  {
    id: "summary",
    label: "Oppsummering",
    minWidth: 50,
    align: "left",
    format: value => value.toLocaleString()
  }
];

const useStyles = makeStyles(theme => ({
  root: {
    width: "70%",
    marginTop: theme.spacing(12),
    marginLeft: 290,
    overflowX: "auto",
    borderRadius: 14
  },
  table: {
    minWidth: 500
  },
  tableWrapper: {
    maxHeight: 900,
    overflow: "auto"
  },
  label: {
    display: "inline",
    padding: ".2em .6em .3em",
    fontSize: "75%",
    fontWeight: 700,
    lineHeight: 1,
    backgroundColor: "lightblue",
    color: "#000",
    textAlign: "center",
    whiteSpace: "nowrap",
    verticalAlign: "baseline",
    borderRadius: ".25em"
  }
}));

export default function Issues(props) {
  const classes = useStyles();
  const [dataset, setData] = useState([]);

  const [state] = useState({
    columns: [
      {
        title: "Prioritet",
        field: "priority",
        render: data => (
          <div
            className="priority"
            style={{
              color:
                data.priority === "Øyeblikkelig"
                  ? "darkred"
                  : "" || data.priority === "Høy"
                  ? "red"
                  : "" || data.priority === "Normal"
                  ? "white"
                  : "" || data.priority === "Haster"
                  ? "yellow"
                  : "" || data.priority === "Lav"
                  ? "grey"
                  : ""
            }}
          >
            {data.priority}
          </div>
        )
      },
      { title: "Oppsummering", field: "summary" },
      {
        title: "ID",
        field: "_id",
        type: "numeric",
        align: "left",
        render: data => (
          <span>
            <Link to={"/vis-sak/" + data._id} className="link underline">
              {data._id}
            </Link>
          </span>
        )
      },
      { title: "Kommentar", field: "kommentar" },
      { title: "Kategori", field: "category" },
      { title: "Alvorlighetsgrad", field: "severity" },
      {
        title: "Status",
        field: "status",
        render: data => (
          <div
            className="status"
            style={{
              color:
                data.status === "Åpen"
                  ? "lightgreen"
                  : "" || data.status === "Lukket"
                  ? "gray"
                  : ""
            }}
          >
            {data.status}
          </div>
        )
      },
      {
        title: "Oppdatert",
        field: "updatedAt",
        render: data => <div>{formattedDate(data.updatedAt)}</div>
      }
    ]
  });

  useEffect(() => {
    getIssues();
  }, [!dataset]);

  const getIssues = async () => {
    let res = await issueService.getAll();
    setData(res);
  };

  return (
    <Paper className={classes.root}>
      <div className={classes.tableWrapper}>
        <React.Fragment>
          <MaterialTable
            options={{
              headerStyle: {
                backgroundColor: "rgb(37, 30, 51)",
                color: "#FFF"
              },
              rowStyle: {
                boxShadow: "0 3px 10px rgba(51, 51, 51, 0.1)"
              }
            }}
            title="Registrerte saker"
            columns={state.columns}
            data={dataset}
          />
        </React.Fragment>
      </div>
    </Paper>
  );
}
