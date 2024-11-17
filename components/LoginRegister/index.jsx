import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Paper } from "@mui/material";

import { useContext } from 'react';
import { CurrentUserContext } from '../../photoShare';

import { useNavigate } from 'react-router-dom';

function LoginRegister(){

    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [newUserId, setNewUserId] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [occupation, setOccupation] = useState('');
    const [firstname, setFirstName] = useState('');
    const [lastname, setLastName] = useState('');
    const [registrationMsg, setRegistrationMsg] = useState('');
    const {currentUser, setCurrentUser} = useContext(CurrentUserContext);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
      event.preventDefault();
        try {
          const response = await fetch('http://localhost:3000/admin/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ login_name: userId, password: password }), // Sending userId
          });

          const data = await response.json();
          console.log("data=", data)   
          if(response.status === 400 && data.message !== null){
            console.log(data.message);
            setErrorMsg(data.message)
            return;
          }
          navigate("/users/"+data._id);
          setCurrentUser(data);
          // console.log("current user =", currentUser);
          // navigate to the page before the login
          
        } catch (error) {
          console.log("error")
        }

        console.log("Finished waiting");

      };

      const handleRegistration = async (event) => {
        event.preventDefault();


        if(newPassword !== confirmPassword){
          console.log("Passwords don't match");
          setRegistrationMsg("Passwords don't match. Check passwords again before submitting.")
          setConfirmPassword('');
          return;
        }


          try {
            const response = await fetch('http://localhost:3000/user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ login_name: newUserId, 
                                     password: newPassword,
                                     location: location,
                                     occupation: occupation,
                                     first_name: firstname,
                                     last_name: lastname,
                                     description: description }), // Sending userId
            });
  
            const data = await response.json();
            console.log("data=", data)   
            setRegistrationMsg(data.message);

            if(response.ok)
            {
              setNewUserId('');
              setNewPassword('');
              setFirstName('');
              setLastName('');
              setDescription('');
              setConfirmPassword('');
              setLocation('');
              setOccupation('');
            }
            
          } catch (error) {
            console.log("error")
          }
  
          console.log("Finished waiting");
  
        };


    return (
        <>
        <div style={{ maxWidth: '300px', margin: '0 auto', padding: '20px' }}>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
            <div>
            <label>User ID</label>
            <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', margin: '8px 0' }}
            />
            </div>
            <div>
            <label>Password</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', margin: '8px 0' }}
            />
            </div>
            {(errorMsg !== '') ?
              <Typography sx={{ color: 'red', fontSize: '0.875rem' }}>
                {errorMsg}
              </Typography>
              :
              <></>
            }
            <Typography variant="body2">
              New user? Sign up in the Registration section
            </Typography>
            <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: 'blue', color: 'white' }}>
                Login
            </button>
        </form>
        </div>
        <Paper sx={{padding: '90px'}}>
            <Typography>
              Registration:
            </Typography>
            <div>
              <form onSubmit={handleRegistration}>
                  <div>
                  <label>User ID(login name)</label>
                  <input
                      type="text"
                      value={newUserId}
                      onChange={(e) => setNewUserId(e.target.value)}
                      required
                      style={{ width: '100%', padding: '8px', margin: '8px 0' }}
                  />
                  </div>
                  <div>
                  <label>Password</label>
                  <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      style={{ width: '100%', padding: '8px', margin: '8px 0' }}
                  />
                  </div>
                  <div>
                  <label>Retype Password</label>
                  <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      style={{ width: '100%', padding: '8px', margin: '8px 0' }}
                  />
                  </div>
                  <div>
                  <label>First name</label>
                  <input
                      type="text"
                      value={firstname}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      style={{ width: '100%', padding: '8px', margin: '8px 0' }}
                  />
                  </div>             
                  <div>
                  <label>Last name</label>
                  <input
                      type="text"
                      value={lastname}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      style={{ width: '100%', padding: '8px', margin: '8px 0' }}
                  />
                  </div>
                  <div>
                  <label>Location</label>
                  <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      style={{ width: '100%', padding: '8px', margin: '8px 0' }}
                  />
                  </div>
                  <div>
                  <label>Description</label>
                  <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      style={{ width: '100%', padding: '8px', margin: '8px 0' }}
                  />
                  </div>
                  <div>
                  <label>Occupation</label>
                  <input
                      type="text"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      required
                      style={{ width: '100%', padding: '8px', margin: '8px 0' }}
                  />
                  </div>
                  {(registrationMsg !== '') ?
                    <Typography>
                      {registrationMsg}
                    </Typography>
                    :
                    <></>
                    }
                  <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: 'blue', color: 'white' }}>
                      Register Me
                  </button>
              </form>
            </div>

        </Paper>
        </>
    )


}

export default LoginRegister;