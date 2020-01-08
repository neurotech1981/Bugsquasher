import React, { Component, useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import useReactRouter from "use-react-router";
import Paper from "@material-ui/core/Paper";
import auth from "../auth/auth-helper";
import { getUsers, findUserProfile } from "../utils/api-user";
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
      {
        title: "Navn",
        field: "name",
        editComponent: props => (
          <input
            type="text"
            value={props.value}
            onChange={e => props.onChange(e.target.value)}
          />
        )
      },
      {
        title: "Rolle",
        field: "role",
        lookup: { bruker: "bruker", admin: "admin" }
      },
      {
        title: "Rettigheter",
        field: "rights",
        lookup: { Les: "les", Skriv: "skriv" }
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

  const [values, setValues] = useState(state);
  const [users, setUsers] = useState([]);
  const [myself, setMyself] = useState([]);

  const init = userId => {
    const jwt = auth.isAuthenticated();
    findUserProfile(
      {
        userId: userId
      },
      { t: jwt.token }
    ).then(myself => {
      if (myself.error) {
        setValues({ redirectToSignin: true });
      } else {
        setMyself(myself);
      }
    });

    getUsers({ t: jwt.token }).then(data => {
      if (data.error) {
        setValues({ redirectToSignin: true });
      } else {
        setUsers(data.data);
      }
    });
  };

  useEffect(() => {
    if (!users.length) {
      init(match.params.userId);
    }
  }, [match.params.userId]);

  // Slett bruker
  const deleteFromDB = idTodelete => {
    axios.delete("/api/removeUser", {
      data: {
        _id: idTodelete
      }
    });
  };

  // Rediger bruker
  const updateUser = (idToBeUpdated, name, role, rights, email) => {
    axios.post("/api/edituser", {
      _id: idToBeUpdated,
      role: myself.role,
      update: {
        name: name,
        role: role,
        rights: rights,
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
                backgroundImage:
                  "linear-gradient(to top, rgb(15, 76, 129) 0%, rgb(6, 80, 249) 100%)",
                color: "#FFF"
              },
              rowStyle: {
                boxShadow: "0 3px 5px rgba(51, 51, 51, 0.1)"
              }
            }}
            title="Bruker administrasjon"
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
                  setTimeout(() => {
                    {
                      const data = users;
                      const index = data.indexOf(oldData);
                      data[index] = newData;
                      setUsers(data);
                      updateUser(
                        data[index]._id,
                        data[index].name,
                        data[index].role,
                        data[index].rights,
                        data[index].email
                      );
                    }
                    resolve(newData);
                    init();
                    reject(new Error("Noe gikk galt!"));
                  }, 1000);
                }),
              onRowDelete: oldData =>
                new Promise((resolve, reject) => {
                  setTimeout(() => {
                    {
                      let data = users;
                      const index = data.indexOf(oldData);
                      deleteFromDB(data[index]._id);
                    }
                    resolve();
                    init();
                  }, 1000);
                })
            }}
          />
        </React.Fragment>
      </div>
    </Paper>
  );
}
