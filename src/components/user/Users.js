import React, { Component, useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import useReactRouter from "use-react-router";
import Paper from "@material-ui/core/Paper";
import auth from "../auth/auth-helper";
import { getUsers, editUser } from "../utils/api-user";
import MaterialTable from "material-table";
import axios from "axios";

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

export default function Users(props) {
  const [userList] = useState({
    columns: [
      { title: "ID", field: "_id", editable: "never" },
      { title: "Navn", field: "name" },
      {
        title: "Rolle",
        field: "role",
        lookup: { bruker: "bruker", admin: "admin" }
      },
      {
        title: "E-Post",
        field: "email",
        editComponent: props => (
          <input
            type="text"
            value={props.value}
            onChange={e => props.onChange(e.target.value)}
          />
        )
      }
    ]
  });

  const { history, location, match } = useReactRouter();
  const state = {
    redirectToSignin: false
  };

  const { id } = props.match.params;

  const [values, setValues] = useState(state);
  const [users, setUsers] = useState([]);

  const init = () => {
    const jwt = auth.isAuthenticated();
    getUsers({ t: jwt.token }).then(data => {
      if (data.error) {
        setValues({ redirectToSignin: true });
      } else {
        setUsers(data.data);
        console.log(data.data);
      }
    });
  };

  useEffect(() => {
    init();
  }, []);

  // Rediger varelinje og oppdater database
  const updateUser = (idToBeUpdated, name, role, email) => {
    console.log("STUFF: " + idToBeUpdated, name, role, email);
    axios.post("/api/edituser", {
      _id: idToBeUpdated,
      update: {
        name: name,
        role: role,
        email: email
      }
    });
  };

  const classes = useStyles();

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
            title="Bruker Administrasjon"
            columns={userList.columns}
            data={users}
            editable={{
              onRowAdd: newData =>
                new Promise((resolve, reject) => {
                  setTimeout(() => {
                    {
                      const data = users;
                      data.push(newData);
                      setUsers({ data }, () => resolve());
                    }
                    resolve();
                  }, 1000);
                }),
              onRowUpdate: (newData, oldData) =>
                new Promise((resolve, reject) => {
                  setTimeout(e => {
                    {
                      const jwt = auth.isAuthenticated();
                      const data = users;
                      const index = data.indexOf(oldData);
                      data[index] = newData;
                      setUsers(data);
                      updateUser(
                        data[index]._id,
                        data[index].name,
                        data[index].role,
                        data[index].email
                      );
                      resolve();
                    }
                  }, 1000);
                }),
              onRowDelete: oldData =>
                new Promise((resolve, reject) => {
                  setTimeout(() => {
                    {
                      let data = users;
                      const index = data.indexOf(oldData);
                      data.splice(index, 1);
                      setUsers({ data }, () => resolve());
                    }
                    resolve();
                  }, 1000);
                })
            }}
          />
        </React.Fragment>
      </div>
    </Paper>
  );
}
