/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import useReactRouter from "use-react-router";
import Paper from "@material-ui/core/Paper";
import MaterialTable from "material-table";
import axios from "axios";
import TextField from "@material-ui/core/TextField";
import { registerUser, getUsers, findUserProfile } from "../utils/api-user";
import auth from "../auth/auth-helper";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "70%",
    marginTop: theme.spacing(12),
    marginLeft: 290,
    overflowX: "auto",
    backgroundColor: "rgb(255, 255, 255)",
    color: "rgb(33, 43, 54)",
    transition: "boxShadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
    backgroundImage: "none",
    overflow: "hidden",
    boxShadow:
      "rgb(145 158 171 / 24%) 0px 0px 2px 0px, rgb(145 158 171 / 24%) 0px 16px 32px -4px",
    borderRadius: "16px",
    position: "relative",
    zIndex: 0,
  },
  table: {
    minWidth: 500,
  },
  tableWrapper: {
    maxHeight: 900,
    overflow: "auto",
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
    borderRadius: ".25em",
  },
}));

export default function Users() {
  const [userList] = useState({
    columns: [
      {
        title: "Navn",
        field: "name",
        editable: "always",
        editComponent: (props) => (
          <TextField
            type="text"
            variant="outlined"
            // eslint-disable-next-line react/destructuring-assignment
            value={props.value}
            size="small"
            onChange={(e) => props.onChange(e.target.value)}
          />
        ),
      },
      {
        title: "Rolle",
        field: "role",
        editable: "always",
        lookup: { Bruker: "Bruker", Admin: "Admin" },
      },
      {
        title: "Rettigheter",
        field: "rights",
        editable: "always",
        lookup: { Les: "Les", Skriv: "Skriv" },
        render: (data) => (
          <div
            className="priority"
            style={{
              fontSize: "1em",
              fontWeight: "600",
              width: "10vh",
              textShadow:
                "2px 4px 4px rgba(0,0,0,0.2), 0px -5px 10px rgba(255,255,255,0.15)",
              color: "#FFFFFF",
              borderRadius: "1rem",
              backgroundColor:
                data.rights === "Les" ?
                  "rgba(255, 200, 204, 1)"
                  : "" || data.rights === "Skriv" ?
                  "rgba(200, 200, 228, 1)"
                  : "",
              padding: "0.5em",
            }}
          >
            {data.rights}
          </div>
        ),
      },
      {
        title: "E-Post",
        field: "email",
        editable: "always",
        editComponent: (props) => (
          <TextField
            type="text"
            variant="outlined"
            // eslint-disable-next-line react/destructuring-assignment
            value={props.value}
            size="small"
            onChange={(e) => props.onChange(e.target.value)}
          />
        ),
      },
      {
        title: "Endre passord",
        field: "password",
        editable: "always",
        editComponent: (props) => (
          <form>
            <TextField
              autoComplete="new-password"
              type="password"
              variant="outlined"
              size="small"
              onChange={(e) => props.onChange(e.target.value)}
            />
          </form>
        ),
      },
    ],
  });

  const { match } = useReactRouter();
  const state = {
    redirectToSignin: false,
  };

  // eslint-disable-next-line no-unused-vars
  const [values, setValues] = useState(state);
  const [users, setUsers] = useState([]);
  const [myself, setMyself] = useState([]);

  const init = (userId) => {
    const jwt = auth.isAuthenticated();
    findUserProfile(
      {
        userId: userId,
      },
      jwt.token
    ).then((myself) => {
      if (myself.error) {
        setValues({ redirectToSignin: true });
      } else {
        setMyself(myself);
      }
    });

    getUsers(jwt.token).then((data) => {
      if (data.error) {
        setValues({ redirectToSignin: true });
      } else {
        setUsers(data.data);
      }
    });
  };

  useEffect(() => {
    if (!myself.length) {
      init(match.params.userId);
    }
  }, [myself.length, match.params.userId]);

  // Slett bruker
  const deleteFromDB = (idTodelete) => {
    const jwt = auth.isAuthenticated();
    axios.post(`/api/removeUser/${idTodelete}`, {
      token: jwt.token,
    });
    init(match.params.userId);
  };

  // Rediger bruker
  const updateUser = (idToBeUpdated, _name, _role, _rights, _email) => {
    const jwt = auth.isAuthenticated();

    const data = {
      role: myself.role,
      name: _name,
      update: {
        name: _name,
        role: _role,
        rights: _rights,
        email: _email,
      },
    };

    axios.post(`/api/edituser/${idToBeUpdated}`, data, {
      headers: { Authorization: jwt.token },
    });
  };

  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <div className={classes.tableWrapper}>
        <React.Fragment key="key">
          <MaterialTable
            options={{
              headerStyle: {
                backgroundColor: "rgb(255, 255, 255)",
                color: "#000",
              },
            }}
            title="Bruker administrasjon"
            columns={userList.columns}
            data={users}
            editable={{
              onRowAdd: (newData) =>
                new Promise((resolve, reject) => {
                  setTimeout(() => {
                    {
                      const jwt = auth.isAuthenticated();

                      const user = {
                        name: newData.name || undefined,
                        email: newData.email || undefined,
                        password: newData.password || undefined,
                        token: jwt.token || undefined,
                      };
                      registerUser(user).then((data) => {
                        if (data.error) {
                          setValues({ error: data.error });
                        } else {
                          setValues({ error: "", open: true });
                        }
                      });
                    }
                    init();
                    resolve(newData);
                    reject(new Error("Noe gikk galt!"));
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
                    init(match.params.userId);
                    resolve(newData);
                    reject(new Error("Noe gikk galt!"));
                  }, 1000);
                }),
              onRowDelete: (oldData) =>
                new Promise((resolve) => {
                  setTimeout(() => {
                    {
                      const data = users;
                      const index = data.indexOf(oldData);
                      deleteFromDB(data[index]._id);
                    }
                    init(match.params.userId);
                    resolve();
                  }, 1000);
                }),
            }}
          />
        </React.Fragment>
      </div>
    </Paper>
  );
}
