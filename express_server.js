function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

const express = require('express');
const morgan = require('morgan');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const usersDatabase = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// Middleware Setup
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// Homepage (temp redirects to all URLs page)
app.get('/', (req, res) => {
  res.redirect('/urls');
});

// Registration Page
app.get('/register', (req, res) => {
  const username = req.cookies["username"];

  const templateVars = {
    username
  };

  res.render('register', templateVars);
});

// Redirect to Long URL using Short URL
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];

  res.redirect(longURL);
});

// All URLs Page
app.get('/urls', (req, res) => {
  const username = req.cookies["username"];

  const templateVars = {
    urls: urlDatabase,
    username
  };

  res.render('urls_index', templateVars);
});

// Create New Short URL Page
app.get('/urls/new', (req, res) => {
  const username = req.cookies["username"];

  const templateVars = {
    username
  };

  res.render('urls_new', templateVars);
});

// Specific Short URL Entry Page
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;

  if (!urlDatabase[shortURL]) {
    res.status(404).send('Short URL not found');
    return;
  }

  const username = req.cookies["username"];
  const longURL = urlDatabase[shortURL];

  const templateVars = {
    shortURL,
    longURL,
    username
  };

  res.render('urls_show', templateVars);
});

// Login with Username
app.post('/login', (req, res) => {
  const username = req.body.username;

  res.cookie('username', username);
  res.redirect(`/urls`);
});

// Logout
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect(`/urls`);
});

// Authenticate login credentials
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const username = req.body.username;
  const password = req.body.password;
  
  const newUser = {
    id,
    username,
    password
  }

  usersDatabase[id] = newUser;

  res.redirect(`/urls`);
});

// Submit new Short URL
app.post('/urls', (req, res) => {
  const newURL = generateRandomString();
  urlDatabase[newURL] = req.body.longURL;

  res.redirect(`/urls/${newURL}`);
});

// Edit Short URL
app.post('/urls/:shortURL/edit', (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;

  urlDatabase[shortURL] = newLongURL;

  res.redirect(`/urls/${shortURL}`);
});

// Delete Short URL
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;

  if (!urlDatabase[shortURL]) {
    res.status(404).send('Short URL not found');
    return;
  }

  delete urlDatabase[shortURL];

  res.redirect('/urls');
});

// Catchall Case
app.get('*', (req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, () => {
  console.log(`TinyApp Server listening on port ${PORT}`);
});
