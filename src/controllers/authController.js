const config = require('../config');
const linkedinService = require('../services/linkedinService');

function buildAuthUrl() {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.linkedin.clientId,
    redirect_uri: config.linkedin.redirectUri,
    scope: config.linkedin.scopes.join(' '),
    state: Math.random().toString(36).slice(2),
  });
  return `${config.linkedin.authUrl}?${params}`;
}

async function login(req, res) {
  res.redirect(buildAuthUrl());
}

async function callback(req, res) {
  const { code, error } = req.query;
  if (error || !code) return res.redirect('/?error=auth_failed');

  try {
    const token = await linkedinService.exchangeCodeForToken(code);
    req.session.user = await linkedinService.getUserProfile(token);
    res.redirect('/');
  } catch (err) {
    console.error('Auth callback error:', err.response?.data || err.message);
    res.redirect('/?error=token_failed');
  }
}

module.exports = { login, callback };
