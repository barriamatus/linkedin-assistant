const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config');

const client = new Anthropic({ apiKey: config.anthropic.apiKey });

const SYSTEM_PROMPT = `Eres un asistente experto en LinkedIn y marketing de contenidos en español.
Tu objetivo es ayudar al usuario a crear contenido profesional, auténtico y atractivo para LinkedIn.
Siempre escribes en español (Chile), con un tono profesional pero cercano.
Tus posts tienen entre 150-300 palabras, incluyen emojis apropiados, hashtags relevantes, y terminan con una pregunta para generar engagement.
Para comentarios, eres conciso, valioso y genuino (máximo 3 oraciones).`;

async function chat(messages) {
  const response = await client.messages.create({
    model: config.anthropic.model,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  });
  return response.content[0].text;
}

async function generatePost({ topic, tone, context }) {
  return chat([{
    role: 'user',
    content: `Crea un post de LinkedIn sobre: "${topic}".
Tono deseado: ${tone}.
${context ? `Contexto adicional: ${context}` : ''}
Incluye hashtags relevantes y una pregunta al final para generar conversación.`,
  }]);
}

async function improvePost({ draft, instructions }) {
  return chat([{
    role: 'user',
    content: `Mejora este borrador de post para LinkedIn.
${instructions ? `Instrucciones: ${instructions}` : 'Mejora el engagement, claridad y profesionalismo.'}

Borrador:
"${draft}"

Devuelve solo el post mejorado, sin comentarios.`,
  }]);
}

async function suggestComments({ postText, angle }) {
  return chat([{
    role: 'user',
    content: `Sugiere 3 comentarios diferentes para este post de LinkedIn. Ángulo: ${angle}.

Post:
"${postText}"

Cada comentario debe ser genuino, añadir valor y ser máximo de 2-3 oraciones.
Devuelve solo los 3 comentarios numerados, sin explicaciones.`,
  }]);
}

async function evaluateShare({ contentUrl, contentSummary }) {
  const text = await chat([{
    role: 'user',
    content: `Evalúa este contenido y decide si vale la pena compartirlo en LinkedIn.
${contentUrl ? `URL: ${contentUrl}` : ''}
${contentSummary ? `Resumen: ${contentSummary}` : ''}

Responde en JSON con:
- "worth_sharing": true/false
- "reason": por qué sí o no (1-2 oraciones)
- "post": el post listo para publicar si worth_sharing es true, null si no
- "score": del 1 al 10`,
  }]);

  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : { worth_sharing: false, reason: text, post: null, score: 0 };
  } catch {
    return { worth_sharing: false, reason: text, post: null, score: 0 };
  }
}

async function chatConversation(history, userMessage) {
  const messages = [...history.slice(-10), { role: 'user', content: userMessage }];
  const response = await client.messages.create({
    model: config.anthropic.model,
    max_tokens: 1024,
    system: SYSTEM_PROMPT + '\nEstás en modo chat. Responde preguntas sobre estrategia de LinkedIn, contenido, networking, etc.',
    messages,
  });
  return response.content[0].text;
}

module.exports = { generatePost, improvePost, suggestComments, evaluateShare, chatConversation };
