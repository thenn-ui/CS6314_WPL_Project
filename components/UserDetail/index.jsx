import React, { useEffect, useState } from "react";
import { Typography, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import "./styles.css";
import axios from "axios";

// import fetchModel from "../../lib/fetchModelData";

function UserDetail({userId}) {
  
  const [model, setModel] = useState({}); // State to store fetched data
  const [modelLoading, setModelLoading] = useState(true); // State to manage loading state
  const [userdetails, setUserDetails] = useState({}); // State to store fetched data

  useEffect(() => {

    // fetchModel("http://localhost:3000/user/"+ userId)
    //   .then(result => {
    //     setModel(result); // Set the fetched data to state
    //     setModelLoading(false); // Set loading to false after data is fetched
    //   });

    axios.get("http://localhost:3000/user/"+ userId)
      .then(result => {
        setModel(result); // Set the fetched data to state
        setModelLoading(false); // Set loading to false after data is fetched
      })
      .catch(error => {
        // Handles any error that occurred in the chain
        console.error("Error encountered:", error);
      });

  }, [userId]);


  useEffect(() => {

    if (!modelLoading && model){
      setUserDetails(model.data);
    }

  }, [modelLoading, model]);


  console.log(userdetails);

  return (

    <div>
      {Object.entries(userdetails).map(([key, value], index) => (
        <React.Fragment key={index}>
          <Typography variant="body1" fontWeight="bold">
            {key}:
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: 2 }}>
            {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
          </Typography>
        </React.Fragment>
      ))}

      <Link component={RouterLink} to={"/photos/" + userdetails._id} color="inherit">Click here to view the user`&apos;`s photos </Link>

    </div>
  );
}

export default UserDetail;
