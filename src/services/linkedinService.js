const axios = require('axios');
const config = require('../config');

function createApiClient(accessToken) {
  return axios.create({
    baseURL: config.linkedin.apiBaseUrl,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'Content-Type': 'application/json',
    },
  });
}

async function exchangeCodeForToken(code) {
  const res = await axios.post(
    config.linkedin.tokenUrl,
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.linkedin.redirectUri,
      client_id: config.linkedin.clientId,
      client_secret: config.linkedin.clientSecret,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return res.data.access_token;
}

async function getUserProfile(accessToken) {
  const res = await axios.get(config.linkedin.userinfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return {
    id: res.data.sub,
    name: res.data.name,
    email: res.data.email,
    picture: res.data.picture,
    accessToken,
  };
}

async function publishTextPost(accessToken, authorId, text, visibility = 'PUBLIC') {
  const api = createApiClient(accessToken);
  const response = await api.post('/ugcPosts', {
    author: `urn:li:person:${authorId}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': visibility },
  });
  return response.headers['x-restli-id'] || response.data.id;
}

async function publishComment(accessToken, authorId, postUrn, text) {
  const api = createApiClient(accessToken);
  await api.post(`/socialActions/${encodeURIComponent(postUrn)}/comments`, {
    actor: `urn:li:person:${authorId}`,
    message: { text },
  });
}

module.exports = { exchangeCodeForToken, getUserProfile, publishTextPost, publishComment };
