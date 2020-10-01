function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

const findUserIdByEmail = email => {
  for (const user in usersDatabase) {
    if (usersDatabase[user].email === email) {
      return usersDatabase[user].id;
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

const emailInvalid = email => {
  if (!email) {
    return true;
  }

  for (const user in usersDatabase) {
    if (usersDatabase[user].email === email) {
      return true;
    }
  }

  return false;
};

const passwordInvalid = password => {
  if (!password) {
    return true;
  }

  return false;
};

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
  },
  "user3RandomID": {
     id: "user3RandomID", 
     email: "j@t.com", 
     password: "josh"
   }
};

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
  const user_id = req.cookies['user_id'];
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
  const longURL = urlDatabase[shortURL];

  res.redirect(longURL);
});

// All URLs Page
app.get('/urls', (req, res) => {
  const user_id = req.cookies['user_id'];
  const user = usersDatabase[user_id];

  const templateVars = {
    urls: urlDatabase,
    user
  };

  res.render('urls_index', templateVars);
});

// Create New Short URL Page
app.get('/urls/new', (req, res) => {
  const user_id = req.cookies['user_id'];
  const user = usersDatabase[user_id];

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

  const longURL = urlDatabase[shortURL];
  const user_id = req.cookies['user_id'];
  const user = usersDatabase[user_id];

  const templateVars = {
    shortURL,
    longURL,
    user
  };

  res.render('urls_show', templateVars);
});

// Login with Username
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = findUserIdByEmail(email);

  if (!email || !password) {
    res.status(400).send('No Email and/or Password received');
    res.redirect('/urls'); // temp redirect while login page not done
    return;
  }

  if (!usersDatabase[userId]) {
    res.status(400).send('Email not registered');
    res.redirect('/urls'); // temp redirect while login page not done
    return;
  }

  if (usersDatabase[userId].password !== password) {
    res.status(401).send('Password incorrect');
    res.redirect('/urls'); // temp redirect while login page not done
    return;
  }
  
  res.cookie('user_id', userId);
  res.redirect('/urls');
});

// Logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// Register new user credentials
app.post('/register', (req, res) => {
  let id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  
  while (idInvalid(id)) {
    id = generateRandomString();
  }

  if (emailInvalid(email)) {
    res.status(400).send('Email already registered');
    res.redirect('/register');
    return;
  }

  if (passwordInvalid(password)) {
    res.status(400).send('Password invalid');
    res.redirect('/register');
    return;
  }
  
  const newUser = {
    id,
    email,
    password
  };

  usersDatabase[id] = newUser;
  res.cookie('user_id', id);
  res.redirect('/urls');
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
