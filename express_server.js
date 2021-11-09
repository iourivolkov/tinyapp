const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// set ejs as view engine --> tells app 
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// add route to json url database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// makes POST request data readable
// converts request body from a Buffer into a readable string
// adds the data to the req object under the key - body
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


// add route --> app.get(path, callback)
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// add new route handler for /urls and use res.render() to pass URL data to our template
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  // res.render (template, object containing vars to pass into template)
  res.render("urls_index", templateVars);
})

// add GET route to show the form / render the urls_new template
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// add a second route and template
// ":" indicates shortURL is a route parameter
// /urls/:d route 
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});





// add a POST route to handle the form submission 
