import React from "react";
import ReactDOM from "react-dom/client";
import { Grid, Typography, Paper } from "@mui/material";
import { HashRouter, Route, Routes, useParams, Navigate } from "react-router-dom";
import { useState, createContext } from 'react';

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister";


export const CurrentUserContext = createContext(null);

function UserDetailRoute() {
  const {userId} = useParams();
  console.log("UserDetailRoute: userId is:", userId);
  return <UserDetail userId={userId} />;
}


function UserPhotosRoute() {
  const {userId} = useParams();
  return <UserPhotos userId={userId} />;
}

function PhotoShare() {

  const [currentUser, setCurrentUser] = useState(null)

  return (
    <CurrentUserContext.Provider value={{currentUser, setCurrentUser}}>
    <HashRouter>
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TopBar />
          </Grid>
          <div className="main-topbar-buffer" />
          <Grid item sm={3}>
            <Paper className="main-grid-item">
              {currentUser ?
              // TODO: replace with HTTPS error on no user id in server side. i.e: handle this in the back end
                <UserList />
                :
                <></>
              }
            </Paper>
          </Grid>
          <Grid item sm={9}>
            <Paper className="main-grid-item" sx={{ 
                overflow: 'auto',    // Enable scrolling
                
              }}>
              <Routes>
                {currentUser ?
                  <>
                    <Route path="*" element={<Typography></Typography>} />
                    <Route path="/users/:userId" element={<UserDetailRoute />} />
                    <Route path="/photos/:userId" element={<UserPhotosRoute />} />
                    <Route path="/users" element={<UserList />} />
                  </>
                  :
                  <Route path="*" element={<Navigate to="/login-register" replace />} />
                }
                <Route path="/login-register" element={<LoginRegister/>} />
              </Routes>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </HashRouter>
    </CurrentUserContext.Provider>
  );
}


const root = ReactDOM.createRoot(document.getElementById("photoshareapp"));
root.render(<PhotoShare />);
