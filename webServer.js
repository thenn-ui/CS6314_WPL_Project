/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the project6 collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */


const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const async = require("async");

const express = require("express");
const app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

// XXX - Your submission should work without this line. Comment out or delete
// // this line for tests and before submission!
// const models = require("./modelData/photoApp.js").models;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Importing Project 7 dependencies:

const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
// app.use(express.static(__dirname));


// Project 7 code changes:
app.use(session({secret: "9823sdfh9w0e2lknflu9", 
                 resave: false, 
                 saveUninitialized: false}));

app.use(bodyParser.json());

app.use((req, res, next) => {
  if (!req.session.user && req.path !== '/login-register' && req.url.includes("/photo-share.html")){
    req.session.redirectTo = req.url;
    console.log("got a request. attaching redirection path", req.url, "to session id", req.sessionID);
    // return res.redirect('/login')
  }
  next();
})

// middleware to test if authenticated
function isAuthenticated (req, res, next) {
  if (req.session.user) next()
  else next('route')
}

const path = require('path');

app.get("/photo-share.html/", isAuthenticated, function(req, res){
  console.log("User authenticated. redirect to", req.session.redirectTo);
  res.sendFile(path.join(__dirname, 'photo-share.html'))
})

app.get("/photo-share.html/", function(req, res) {
  console.log("User NOT authenticated");
  res.sendFile(path.join(__dirname, 'photo-share.html'))
})

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 * 
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", async function (request, response) {


  if(!request.session.user)
    return response.status(401).send();


  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    try{

      const info = await SchemaInfo.find({});
      if (info.length === 0) {
            // No SchemaInfo found - return 500 error
            return response.status(500).send("Missing SchemaInfo");
      }
      console.log("SchemaInfo", info[0]);
      return response.json(info[0]); // Use `json()` to send JSON responses
    } catch(err){
      // Handle any errors that occurred during the query
      console.error("Error in /test/info:", err);
      return response.status(500).json(err); // Send the error as JSON
    }

  } else if (param === "counts") {
   // If the request parameter is "counts", we need to return the counts of all collections.
// To achieve this, we perform asynchronous calls to each collection using `Promise.all`.
// We store the collections in an array and use `Promise.all` to execute each `.countDocuments()` query concurrently.
   
    
const collections = [
  { name: "user", collection: User },
  { name: "photo", collection: Photo },
  { name: "schemaInfo", collection: SchemaInfo },
];

try {
  await Promise.all(
    collections.map(async (col) => {
      col.count = await col.collection.countDocuments({});
      return col;
    })
  );

  const obj = {};
  for (let i = 0; i < collections.length; i++) {
    obj[collections[i].name] = collections[i].count;
  }
  return response.end(JSON.stringify(obj));
} catch (err) {
  return response.status(500).send(JSON.stringify(err));
}
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    return response.status(400).send("Bad param " + param);
  }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", async function (request, response) {

  if(!request.session.user)
    return response.status(401).send();

  //response.status(200).send(models.userListModel());
  
  // query the required data from the MongoDB
  try{
    const userlist = await User.find({}).select("_id first_name last_name");
    if (userlist.length === 0) {
      // No userlist found - return 500 error
      return response.status(400).send("Missing User list");
    }
    console.log("UserList", userlist[0]);
    return response.status(200).send(userlist);

  }catch(err){
    // Handle any errors that occurred during the query
    console.error("Error in /user/list:", err);
    return response.status(500).json(err); // Send the error as JSON
  }

});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", async function (request, response) {

  if(!request.session.user)
    return response.status(401).send();

  // const id = request.params.id;
  // const user = models.userModel(id);
  // if (user === null) {
  //   console.log("User with _id:" + id + " not found.");
  //   response.status(400).send("Not found");
  //   return;
  // }
  // response.status(200).send(user);

  // query the required data from the MongoDB
  try{
    const userdetails = await User.findOne({_id: request.params.id}).select({__v: 0, login_name:0, password:0});
    if (userdetails === null) {
      // No userlist found - return 500 error
      console.log("User with _id:" + request.params.id + " not found.");
      response.status(400).send("User with id=" + request.params.id + " Not found");
      return;
    }
    console.log("User found: ", userdetails);
    response.status(200).send(userdetails);

  }catch(err){
    // Handle any errors that occurred during the query
    console.error("Error in /user/" + request.params.id, err);
    response.status(400).send("User with id=" + request.params.id + " Not found"); // Send the error as JSON
  }

});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", async function (request, response) {

  if(!request.session.user)
    return response.status(401).send();

  const id = request.params.id;
  // const photos = models.photoOfUserModel(id);
  // if (photos.length === 0) {
  //   console.log("Photos for user with _id:" + id + " not found.");
  //   response.status(400).send("Not found");
  //   return;
  // }
  // response.status(200).send(photos);

  try{
    const userphotos = await Photo.find({user_id: id}).select({__v: 0});

    if (userphotos.length === 0) {
      // No userlist found - return 500 error
      console.log("Photos for user with _id:" + id + " not found.");
      response.status(400).send("Photos for user with id=" + id + " Not found");
      return;
    }
    // console.log("Photos for user found: ", userphotos[0].comments);


    const transformedphotos = await Promise.all(userphotos.map(async (photo) =>{

      // for each photo in the user's dir transform the comments
        return {
          _id: photo._id,
          user_id: photo.user_id,
          file_name: photo.file_name,
          date_time: photo.date_time,
          comments: await async.map(photo.comments, async (commentObj)=> {
            
            const userObj = await User.findOne({_id: commentObj.user_id}).select({_id:1, first_name:1, last_name:1});
            // console.log("User obj =", userObj, "obj id = ", commentObj._id);
            return {
              comment: commentObj.comment,
              date_time: commentObj.date_time,
              _id: commentObj._id,
              user: userObj
            };
        })

        };
      }));

    // console.log("Result of transform: ", transformedphotos);
    response.status(200).send(transformedphotos);

  }catch(err){
    // Handle any errors that occurred during the query
    console.error("Error in /photosOfUser/" + id, err);
    response.status(400).send("Photos of User with id=" + id + " Not found"); // Send the error as JSON
  }
});


// app.get("/login-register", function (req, res){
  
// })

app.post('/admin/login', express.urlencoded({ extended: false }), async function (req, res) {
  // login logic to validate req.body.user and req.body.pass
  // would be implemented here. for this example any combo works

  // regenerate the session, which is good practice to help
  // guard against forms of session fixation
  console.log("received post", req.body.login_name);
  // req.session.regenerate(function (err) {
  //   if (err) next(err)
  
  //   // store user information in session, typically a user id
  //   req.session.user = req.body.userId

  //   // save the session before redirection to ensure page
  //   // load does not happen before session is saved
  //   req.session.save(function (err) {
  //     if (err) return next(err)
  //     console.log("saved the req session", req.session.user, "redirect to", req.session.redirectTo);
  //     let data = {}
  //     data.userid = req.session.user;
  //     data.redirectTo = req.session.redirectTo;
  //     res.status(200).send(data);
  //   })
  // })


  // check whether the user exists:

  const userObj = await User.findOne({login_name: req.body.login_name}).select({_id: 1, first_name:1, last_name:1, login_name:1, password:1})


  if(userObj === null){
    return res.status(400).json({message: "No user with the given login ID found. Please try again."})
  }

  if(userObj.password !== req.body.password){
    console.log(userObj.password)
    console.log(req.body.password)
    return res.status(400).json({message: "Incorrect password. Try again."})
  }


  req.session.user = req.body.login_name
  req.session.save(function (err) {
    if (err) return next(err)

    // let data = {}
    // data.login_name = req.session.user;
    // data.redirectTo = req.session.redirectTo;
    const {login_name, password , ...userDetails} = userObj._doc;
    console.log(userDetails);
    res.status(200).send(userDetails);
  })

})

app.post('/admin/logout', express.urlencoded({ extended: false }), function (req, res) {
  
  console.log("received /admin/logout post", req.body.userId);

  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).send("Failed to log out");
      }
      res.clearCookie("connect.sid"); // Clear the cookie (default session cookie name)
      res.status(200).send("Logged out successfully");
    });
  } else {
    res.status(400).send("No session found");
  }
})


app.post('/user', express.urlencoded({ extended: false }), async function (req, res) {
  
  console.log("received /user post", req.body.login_name);

  //check if user already present:

  const userObj = await User.findOne({login_name: req.body.login_name}).select({})
  if(userObj !== null){
    return res.status(400).json({message: "User with the given login ID already exists"})
  }

  // check if the first name and last name and password are non empty
  if (req.body.first_name === '' || req.body.last_name === '' || req.body.password === '' )
    return res.status(400).json({message: "some fields are empty strings" })

  const newUser = new User(req.body)

  newUser.save().then(() => {
    console.log('User added to database');
    return res.status(200).json({login_name: req.body.login_name, message: "User registered successfully!"})
  }).catch(err => {
    console.error('Error saving user:', err);
    return res.status(400).json({message: `Error saving user: ${err}` })
  });
 
})



app.post('/commentsOfPhoto/:photo_id', express.urlencoded({ extended: false }), async function (req, res) {
  
  console.log("received /commentsOfPhoto/:photo_id post", req.body.userId);

  if (!req.session) {
   res.status(401).send("User Not logged in"); 
  }

  const comment = req.body.comment;
  const date_time = req.body.date_time;
  const user_id = req.body.user_id;
  const photo_id = req.params.photo_id;


  const newCommentObj = {comment, date_time, user_id}

  console.log(comment);
  console.log(date_time);
  console.log(user_id);

  try{
    const updatedPhoto = await Photo.findByIdAndUpdate(
      photo_id,
      {
        $push: {comments: newCommentObj}
      },
      {new: false}
    );

    const comment_id = updatedPhoto.comments[updatedPhoto.comments.length - 1]._id;

    return res.status(200).json({message:"Updated comment!", comment_id});

  }catch(error){
    console.error("Error adding new comment:", error);
    return res.status(400).json({message: "Error adding new comment:"+error});
  }

  
})




/////////////////////////////////////////////////////////////////////////////////////

app.use(express.static(__dirname));

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
