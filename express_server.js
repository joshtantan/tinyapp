function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

const express = require('express');
const morgan = require('morgan');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));

// Homepage (temp redirects to all URLs page)
app.get('/', (req, res) => {
  res.redirect('/urls');
});

// Redirect to Long URL using Short URL
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];

  res.redirect(longURL);
});

// All URLs Page
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };

  res.render('urls_index', templateVars);
});

// Create New Short URL Page
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

// Specific Short URL Entry Page
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;

  if (!urlDatabase[shortURL]) {
    res.status(404).send('Short URL not found');
    return;
  }

  const longURL = urlDatabase[shortURL];

  const templateVars = {
    shortURL,
    longURL
  };

  res.render('urls_show', templateVars);
});

// Submit new Short URL
app.post('/urls', (req, res) => {
  const newURL = generateRandomString();
  urlDatabase[newURL] = req.body.longURL;

  res.redirect(`/urls/${newURL}`);
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
