const aiService = require('../services/aiService');

async function generatePost(req, res) {
  const { topic, tone = 'profesional', context = '' } = req.body;
  if (!topic) return res.status(400).json({ error: 'Se requiere un tema' });
  try {
    const post = await aiService.generatePost({ topic, tone, context });
    res.json({ post });
  } catch (err) {
    console.error('generatePost error:', err.message);
    res.status(500).json({ error: 'Error al generar el post' });
  }
}

async function improvePost(req, res) {
  const { draft, instructions = '' } = req.body;
  if (!draft) return res.status(400).json({ error: 'Se requiere el borrador' });
  try {
    const improved = await aiService.improvePost({ draft, instructions });
    res.json({ improved });
  } catch (err) {
    console.error('improvePost error:', err.message);
    res.status(500).json({ error: 'Error al mejorar el post' });
  }
}

async function suggestComment(req, res) {
  const { postText, angle = 'aportar valor' } = req.body;
  if (!postText) return res.status(400).json({ error: 'Se requiere el texto del post' });
  try {
    const suggestions = await aiService.suggestComments({ postText, angle });
    res.json({ suggestions });
  } catch (err) {
    console.error('suggestComment error:', err.message);
    res.status(500).json({ error: 'Error al generar sugerencias' });
  }
}

async function evaluateShare(req, res) {
  const { contentUrl, contentSummary } = req.body;
  if (!contentSummary && !contentUrl) return res.status(400).json({ error: 'Se requiere resumen o URL' });
  try {
    const result = await aiService.evaluateShare({ contentUrl, contentSummary });
    res.json(result);
  } catch (err) {
    console.error('evaluateShare error:', err.message);
    res.status(500).json({ error: 'Error al evaluar el contenido' });
  }
}

async function chat(req, res) {
  const { messages = [], userMessage } = req.body;
  if (!userMessage) return res.status(400).json({ error: 'Se requiere un mensaje' });
  try {
    const reply = await aiService.chatConversation(messages, userMessage);
    res.json({ reply });
  } catch (err) {
    console.error('chat error:', err.message);
    res.status(500).json({ error: 'Error en el chat' });
  }
}

module.exports = { generatePost, improvePost, suggestComment, evaluateShare, chat };
