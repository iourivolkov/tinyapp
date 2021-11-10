const express = require("express");
const morgan = require("morgan");
app.use(morgan('dev'));
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const app = express();
const PORT = 8080; 

// SETS EJS AS VIEW ENGINE
// -----------------------
app.set("view engine", "ejs");

// GENERATES RANDOMIZED 6 CHAR STRING
// ----------------------------------
const generateRandomString = () => {
  let output = ' ';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnoprstuvwxyz0123456789';
  const charLength = characters.length;
  const maxRandomStringLength = 6;

  for(let i = 0; i < maxRandomStringLength; i++) {
    output += characters.charAt(Math.floor(Math.random() * charLength));
  }
  return output; 
}
// DATABSE OBJECT
// --------------
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// TEST GET REQUEST
// ----------------
app.get("/", (req, res) => {
  res.send("Hello!");
});

//SERVER SETUP
// -----------
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

// ROUTE TO JOIN URL DATABASE
// --------------------------
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// MAKES POST REQUEST READABLE
// ---------------------------
// converts request body from a Buffer into a readable string
// adds the data to the req object under the key - body
// const bodyParser = require("body-parser");
app.use(express.urlencoded({extended: true}));
// extended - allows us to input objects and arrays + primitives

// COOKIE PARSER - MIDDLEWARE - HELPS READ COOKIE VALUES
// -----------------------------------------------------

// res.cookie(name, value [, options]) <-- implementation


//ADD ROUTE - HTML settings 
// ------------------------
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// add new route handler for /urls and use res.render() to pass URL data to our template
app.get("/urls", (req, res) => {
  // template vars = object that gets passed to ejs for rendering
  let templateVars = { urls: urlDatabase, username: req.cookies['username'] };
  // res.render (template, object containing vars to pass into template)
  res.render("urls_index", templateVars);
})

// GET ROUTE TO SHOW FORM / RENDER URL TEMPLATE 
// --------------------------------------------
app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies['username']}
  res.render("urls_new", templateVars);
});

// SECOND ROUTE & EJS TEMPLATE
// ---------------------------
// ":" indicates shortURL is a route parameter
// shortURL stores in req.params 
// /urls/:d route 
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies['username'] };
  res.render("urls_show", templateVars);
});

// POST ROUTE TO HANDLE FORM SUBMISSION
// ------------------------------------
app.post("/urls", (req, res) => {
  let uniqueShortURL = generateRandomString();
  urlDatabase[uniqueShortURL] = req.body.longURL;
 // redirect client to new page - page link = randomly generated string
  res.redirect(`/urls/${uniqueShortURL}`);   
});

// REDIRECT USER TO LONG URL
// -------------------------
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]; 
  res.redirect(`http://${longURL}`); 
  // longURL = value belonging to the short URL key in URL database
  // add http to prevent infinite loop error / relative path error 
  // redirects to actual link - works
});

// POST ROUTE TO DELETE A RESOURCE
// -------------------------------
app.post("/urls/:shortURL/delete", (req, res) => {
  // use js delete operator to remove property from an object
  delete urlDatabase[req.params.shortURL];
  // redirects to home page (/urls) once resource is removed
  res.redirect('/urls');   
  
});

// POST ROUTE TO UPDATE A RESOURCE 
// -------------------------------
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;

  res.redirect("/urls");

});

// AUTHENTICATION ROUTE 
// --------------------

// LOGIN ROUTE 
// -----------
// set a cookie named username to the value submitted in the request body via login form
// after server has set the cookie - redirect the browser back to /urls page

app.post("/login", (req, res) => {
  // what do we want to do with our login route 
  //const username = req.body.username;
  // res.json({username}); // returns username
  res.cookie('username', req.body.username);
  // redirects to /urls after login
  res.redirect("/urls"); 


  // res only exists inside route authentication
  // res.json() - sends back a json response 
  // when we send data as a form - it will be part of the request --> info will be in the body of the request
  // body is an object 
  
  //res.cookie('username', username)


  
});


// LOGOUT ROUTE 
// ------------














