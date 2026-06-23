const linkedinService = require('../services/linkedinService');
const cacheService = require('../services/cacheService');

async function publishText(req, res) {
  const { text, visibility = 'PUBLIC' } = req.body;
  const { id, accessToken } = req.session.user;

  if (!text?.trim()) return res.status(400).json({ error: 'El texto no puede estar vacío' });

  try {
    const postId = await linkedinService.publishTextPost(accessToken, id, text.trim(), visibility);
    cacheService.addPost({ id: postId, text: text.trim(), created: Date.now(), visibility, lifecycleState: 'PUBLISHED' });
    res.json({ ok: true, postId, message: 'Post publicado exitosamente' });
  } catch (err) {
    console.error('publishText error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Error al publicar el post', details: err.response?.data });
  }
}

async function getMine(req, res) {
  const posts = cacheService.getPosts();
  res.json({ posts });
}

async function publishComment(req, res) {
  const { postUrn, text } = req.body;
  const { id, accessToken } = req.session.user;

  if (!postUrn || !text?.trim()) return res.status(400).json({ error: 'Se requiere postUrn y texto' });

  try {
    await linkedinService.publishComment(accessToken, id, postUrn, text.trim());
    res.json({ ok: true, message: 'Comentario publicado exitosamente' });
  } catch (err) {
    console.error('publishComment error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Error al publicar el comentario', details: err.response?.data });
  }
}

module.exports = { publishText, getMine, publishComment };
