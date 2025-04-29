const express = require('express');
const session = require('express-session');
const path = require('path');
const auth = require('./auth');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'nextstepfxsecret',
  resave: false,
  saveUninitialized: true
}));

app.get('/login', (req, res) => {
  res.redirect(auth.getPatreonAuthURL());
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.send('Missing code.');

  try {
    const isPatron = await auth.checkPatreonMembership(code);
    req.session.isPatron = isPatron;

    if (isPatron) {
      res.redirect('/dashboard');
    } else {
      res.send('Access Denied: You must have an active membership.');
    }
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.send('Authentication failed: ' + (error.response?.data?.error_description || error.message));
  }
});

app.get('/dashboard', (req, res) => {
  if (!req.session.isPatron) return res.redirect('/login');
  res.send('<h1>Welcome to NextStepFXAcademy Premium Portal!</h1><a href="/logout">Logout</a>');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/', (req, res) => {
  res.send('<h1>NextStepFXAcademy Portal</h1><a href="/login">Login with Patreon</a>');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
