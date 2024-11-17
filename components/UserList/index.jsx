import React, { useEffect, useState } from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
  Link,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import "./styles.css";

import axios from "axios";
// import fetchModel from "../../lib/fetchModelData";

function UserList() {

  const [model, setModel] = useState({}); // State to store fetched data
  const [modelLoading, setModelLoading] = useState(true); // State to manage loading state
  const [userList, setUserList] = useState([]); // State to store fetched data


  useEffect(() => {
    // fetchModel("http://localhost:3000/user/list")
    //   .then(result => {
    //     setModel(result); // Set the fetched data to state
    //     setModelLoading(false); // Set loading to false after data is fetched
    //   });

    axios.get("http://localhost:3000/user/list")
      .then(result => {
        setModel(result); // Set the fetched data to state
        setModelLoading(false); // Set loading to false after data is fetched
      })
      .catch(error => {
        // Handles any error that occurred in the chain
        console.error("Error encountered:", error);
      });
  }, []);


  useEffect(() => {

    if (!modelLoading && model){
      setUserList(model.data);
    }

  }, [modelLoading, model]);

  return (
    <div>
      <Typography variant="body1">
        The list of users are:
      </Typography>
      <List component="nav">         
        {userList.map((item, index) => {
          return (
            <React.Fragment key={index}>
            <ListItem>
              <ListItemText primary={(
                <Link component={RouterLink} to={`/users/${item._id}`} color="inherit">
                  {item.last_name + ", " + item.first_name}
                </Link>
              )}/>
            </ListItem>
            <Divider />
            </React.Fragment>
          );
        })}

      </List>
    </div>
  );
}

export default UserList;
