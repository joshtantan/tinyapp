function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

const cookieSession = require('cookie-session');
const express = require('express');
const bcrypt = require('bcrypt');
const morgan = require('morgan');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const urlDatabase = {};
const usersDatabase = {};

// Middleware Setup
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('trust proxy', 1);
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

// Helper Functions
const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
};

const idInvalid = id => {
  if (!id) {
    return true;
  }

  for (const user in usersDatabase) {
    if (usersDatabase[user].id == id) {
      return true;
    }
  }

  return false;
};

const emailRegistered = email => {
  for (const user in usersDatabase) {
    if (usersDatabase[user].email === email) {
      return true;
    }
  }

  return false;
};

const urlsForUser = userID => {
  const filteredURLDatabase = {};

  for (const url in urlDatabase) {
    if (urlDatabase[url].userID == userID) {
      filteredURLDatabase[url] = urlDatabase[url];
    }
  }

  return filteredURLDatabase;
};

// Homepage (temp redirects to all URLs page)
app.get('/', (req, res) => {
  res.redirect('/urls');
});

// Login Page
app.get('/login', (req, res) => {
  const user_id = req.session.user_id;
  const user = usersDatabase[user_id];

  if (user) {
    res.redirect('/urls');
    return;
  }

  const templateVars = {
    user
  };

  res.render('login', templateVars);
});

// Registration Page
app.get('/register', (req, res) => {
  const user_id = req.session.user_id;
  const user = usersDatabase[user_id];

  if (user) {
    res.redirect('/urls');
    return;
  }

  const templateVars = {
    user
  };

  res.render('register', templateVars);
});

// Redirect to Long URL using Short URL
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;

  if (!urlDatabase[shortURL]) {
    res.status(404).send('Short URL not found');
    return;
  }
  
  const longURL = urlDatabase[shortURL].longURL;
  const httpPart = longURL.substr(0, 7);
  const httpsPart = longURL.substr(0, 8);
  
  if (httpPart !== 'http://' && httpsPart !== 'https://') {
    res.status(404).send('URL is invalid');
    return;
  }

  res.redirect(longURL);
});

// All URLs Page
app.get('/urls', (req, res) => {
  const user_id = req.session.user_id;
  const user = usersDatabase[user_id];

  if (!user) {
    res.redirect('/login');
    return;
  }

  const urls = urlsForUser(user_id);

  const templateVars = {
    urls,
    user
  };

  res.render('urls_index', templateVars);
});

// Create New Short URL Page
app.get('/urls/new', (req, res) => {
  const user_id = req.session.user_id;
  const user = usersDatabase[user_id];

  if (!user) {
    res.redirect('/login');
    return;
  }

  const templateVars = {
    user
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

  const user_id = req.session.user_id;
  const user = usersDatabase[user_id];

  if (!user) {
    res.status(403).send('Not logged in');
    return;
  }

  if (urlDatabase[shortURL].userID != user_id) {
    res.status(403).send('Short URL access unauthorized');
    return;
  }

  const longURL = urlDatabase[shortURL].longURL;

  const templateVars = {
    shortURL,
    longURL,
    user
  };

  res.render('urls_show', templateVars);
});

// Log in with email and password
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, usersDatabase);

  if (!email || !password) {
    res.status(400).send('No Email and/or Password received');
    return;
  }

  if (!user) {
    res.status(403).send('Email not registered');
    return;
  }

  if (!bcrypt.compareSync(password, user.password)) {
    res.status(403).send('Password incorrect');
    return;
  }
  
  req.session.user_id = user.id;
  res.redirect('/urls');
});

// Logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// Register new user credentials
app.post('/register', (req, res) => {
  let id = generateRandomString();
  const email = req.body.email;
  const plaintextPassword = req.body.password;
  
  while (idInvalid(id)) {
    id = generateRandomString();
  }

  if (!email || !plaintextPassword) {
    res.status(400).send('No Email and/or Password received');
    return;
  }

  if (emailRegistered(email)) {
    res.status(400).send('Email already registered');
    return;
  }

  const password = bcrypt.hashSync(plaintextPassword, 10);
  
  const newUser = {
    id,
    email,
    password
  };

  usersDatabase[id] = newUser;
  req.session.user_id = id;
  res.redirect('/urls');
});

// Submit new Short URL
app.post('/urls', (req, res) => {
  const newShortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.user_id;

  urlDatabase[newShortURL] = {
    longURL,
    userID
  };

  res.redirect(`/urls/${newShortURL}`);
});

// Edit Long URL
app.post('/urls/:shortURL/edit', (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.session.user_id;
  const user = usersDatabase[user_id];

  if (!user) {
    res.status(403).send('Not logged in');
    return;
  }

  if (urlDatabase[shortURL].userID != user_id) {
    res.status(403).send('Short URL access unauthorized');
    return;
  }

  const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect(`/urls/${shortURL}`);
});

// Delete Short URL
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.session.user_id;
  const user = usersDatabase[user_id];

  if (!user) {
    res.status(403).send('Not logged in');
    return;
  }

  if (urlDatabase[shortURL].userID != user_id) {
    res.status(403).send('Short URL access unauthorized');
    return;
  }

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
