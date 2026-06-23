require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const config = require('./src/config');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
}));

app.use('/auth', require('./src/routes/auth'));
app.use('/api/posts', require('./src/routes/posts'));
app.use('/api/ai', require('./src/routes/ai'));

app.get('/api/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'No autenticado' });
  const { id, name, email, picture } = req.session.user;
  res.json({ id, name, email, picture });
});

app.get('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(config.port, () => {
  console.log(`LinkedIn Assistant corriendo en http://localhost:${config.port}`);
});
