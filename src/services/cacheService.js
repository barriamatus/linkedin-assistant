const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(__dirname, '..', '..', 'posts_cache.json');
const MAX_POSTS = 50;

function load() {
  try {
    if (fs.existsSync(CACHE_FILE)) return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  } catch {}
  return [];
}

function save(posts) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(posts, null, 2));
}

function addPost(post) {
  const posts = load();
  posts.unshift(post);
  save(posts.slice(0, MAX_POSTS));
}

function getPosts() {
  return load();
}

module.exports = { addPost, getPosts };
