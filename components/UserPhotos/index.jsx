import React,  { useEffect, useState } from "react";
import { Card, CardContent, Typography, Link, Divider, TextField, Button, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import "./styles.css";
import axios from "axios";
// import fetchModel from "../../lib/fetchModelData";

import { useContext } from 'react';
import { CurrentUserContext } from '../../photoShare';




const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  const date = new Date(dateString);
  return date.toLocaleString(undefined, options); // Use browser's locale for formatting
};


function UserPhotos({userId}) {

  const [model, setModel] = useState({}); // State to store fetched data
  const [modelLoading, setModelLoading] = useState(true); // State to manage loading state
  const [photodata, setPhotoData] = useState([]); // State to store fetched data

  const {currentUser, setCurrentUser} = useContext(CurrentUserContext);
  const [commentStr, setCommentStr] = useState("");
  const [rerenderFlag, setReRenderFlag] = useState(false);

  useEffect(() => {
    // Fetch model data when the component mounts
    // fetchModel("http://localhost:3000/photosOfUser/"+userId)
    //   .then(result => {
    //     setModel(result); // Set the fetched data to state
    //     setModelLoading(false); // Set loading to false after data is fetched
    //   });
    const fetchData = () => {
    axios.get("http://localhost:3000/photosOfUser/"+userId)
      .then(result => {
        setModel(result); // Set the fetched data to state
        setModelLoading(false); // Set loading to false after data is fetched
      })
      .catch(error => {
        // Handles any error that occurred in the chain
        console.error("Error encountered:", error);
      });
    };

    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);

  }, [rerenderFlag]);

  useEffect(() => {

      if (!modelLoading && model){
        setPhotoData(model.data);
      }

  }, [modelLoading, model, rerenderFlag]);



  const handleCommentPost = async (event, photo_id) => {
    
    event.preventDefault();

    if (commentStr.trim() === "") {
      alert("Comment cannot be empty");
      return;
    }

    // get the timestamp
    const now = new Date().toISOString();

    try {
      const response = await fetch("http://localhost:3000/commentsOfPhoto/"+photo_id, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment:commentStr, date_time:now, user_id:currentUser._id }), // Send the comment
      });

      const data = await response.json();

      if(response.status !== 200)
      {
        console.log(data.message)
        return;
      }

      console.log("Comment sent successfully!");
      setCommentStr(""); // Clear the input field
      // set the state to force a react re render
      setReRenderFlag(data.comment_id);
    } catch (error) {
      console.error("Error sending comment:", error);
    }
  };




  return (
    <>
      <Typography variant="h4">
        Photo Section:
      </Typography>

      {photodata.map((item, index) => (
        <Card key={index} sx={{ marginBottom: 2 }}>
          <CardContent>
            <Typography variant="body1">Created on: {formatDate(item.date_time)}</Typography>
            <img src={"images/"+item.file_name} key={index}/>
            <Divider />
            {(item.comments && item.comments.length > 0) ? (
              item.comments.map((comment, comment_index) => (
                  <div key={comment_index} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                    <Typography variant="body2" sx={{ color: "grey.600", fontSize: "0.675rem", marginRight: "8px", whiteSpace: "nowrap", marginTop: "0" }}>
                      {formatDate(comment.date_time)} -
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: "bold", fontSize: "0.775rem", marginRight: "8px", whiteSpace: "nowrap",  marginTop: "0"}}>
                      <Link component={RouterLink} to={`/users/${comment.user._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        {comment.user.first_name + " " + comment.user.last_name}
                      </Link>
                        :
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: "sans-serif", fontSize: "0.775rem", marginTop: "0"}}>
                      {comment.comment}
                    </Typography>
                  </div>
              ))) 
            : (
              <Typography variant="body1" sx={{ fontFamily: "sans-serif", fontSize: "0.775rem", marginTop: "0"}}>
                No comments yet! Post ASAP to start a discussion.
              </Typography>
              )}

              {/* Latest changes here for handling comments */}
              <Box 
                component="form" 
                onSubmit={(event) => handleCommentPost(event, item._id)} 
                sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 400, margin: "0 auto" }}
              >
                <TextField
                  label="Write your comment"
                  variant="outlined"
                  value={commentStr}
                  onChange={(e) => setCommentStr(e.target.value)} // Update state
                  multiline
                  rows={4} // Adjust height
                  fullWidth
                  required
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  sx={{ alignSelf: "flex-end" }}
                >
                  Submit
                </Button>
              </Box>    
          </CardContent>
        </Card>
      ))}

    </>
  );
}

export default UserPhotos;
