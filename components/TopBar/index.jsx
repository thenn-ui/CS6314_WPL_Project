import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import {useLocation, useNavigate} from "react-router-dom";
import "./styles.css";

// import fetchModel from "../../lib/fetchModelData";
import axios from 'axios';

import { useContext } from 'react';
import { CurrentUserContext } from '../../photoShare';

function TopBar() {

  const {currentUser, setCurrentUser} = useContext(CurrentUserContext);

  const [testdata, setTestData] = useState({}); // State to store fetched data
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [resultContext, setResultContext] = useState(""); // State to store fetched data
  const [model, setModel] = useState({}); // State to store fetched data
  const [modelLoading, setModelLoading] = useState(true); // State to manage loading state

  const location = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch model data when the component mounts
    // fetchModel("http://localhost:3000/test/info")
    //   .then(result => {
    //     setTestData(result); // Set the fetched data to state
    //     setLoading(false); // Set loading to false after data is fetched
    //   });
    axios.get("http://localhost:3000/test/info")
    .then(result => {
          setTestData(result); // Set the fetched data to state
          setLoading(false); // Set loading to false after data is fetched
        })
    .catch(error => {
          // Handles any error that occurred in the chain
          console.error("Error encountered:", error);
      });
  }, [location.pathname]);

  useEffect(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean); 
    let len = pathSegments.length;

    
    if (len < 2 && (pathSegments[0] !== "users" || pathSegments[0] !== "photos")){
      return;
    }

    // Fetch model data when the component mounts
    // fetchModel("http://localhost:3000/user/"+pathSegments[1])
    //   .then(result => {
    //     setModel(result); // Set the fetched data to state
    //     setModelLoading(false); // Set loading to false after data is fetched
    //   });
    axios.get("http://localhost:3000/user/"+pathSegments[1])
    .then(result => {
          setModel(result); // Set the fetched data to state
          setModelLoading(false); // Set loading to false after data is fetched
        })
    .catch(error => {
          // Handles any error that occurred in the chain
          console.error("Error encountered:", error);
        });
  }, [location.pathname]);

  useEffect(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean); 
    let len = pathSegments.length;

    if (len >= 2 && pathSegments[0] === "users"){
      if (!modelLoading && model){
        console.log(model);
        setResultContext(model.data.first_name + " " + model.data.last_name);
      }
    }
    else if(len >= 2 && pathSegments[0] === "photos"){
      if (!modelLoading && model){
        setResultContext("Photos of " + model.data.first_name + " " + model.data.last_name);
      }
    }
    else if (!loading && testdata){
      setResultContext("Version = " + testdata.data.__v); 
    }

  }, [loading, modelLoading, testdata, model, location.pathname]);


  const handleLogout = async () => {
    try {
      // Inform the backend about the logout
      await fetch("http://localhost:3000/admin/logout", { method: "POST" });

      // Clear the current user state
      setCurrentUser(null);

      // Navigate to login page
      navigate("/login-register");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };



  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {(currentUser !== null) ?
          <>
          <Typography variant="h5" color="inherit">
            Hi {currentUser.first_name}
          </Typography> 
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
          </>
          :
          <Typography variant="h5" color="inherit">
            Please login
          </Typography>}
        <Typography variant="h5" color="inherit" sx={{ marginLeft: 'auto' }}>
          {resultContext}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
