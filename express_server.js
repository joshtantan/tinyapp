function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

const express = require("express");
const morgan = require('morgan');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));

// Homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

// (TEST) Displays HTML by brute force
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// (TEST) Displays entire database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// All URLs Page
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Create New URL Page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Specific URL Entry Page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };

  res.render("urls_show", templateVars);
});

// Submit new URL
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console

  const newURL = generateRandomString();

  urlDatabase[newURL] = req.body.longURL;

  res.redirect(`/urls/${newURL}`);
});

// Catchall Case
app.get('*', (req, res) => {
  res.status(404).send('page not found');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
