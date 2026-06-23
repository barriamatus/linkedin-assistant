const $ = (sel) => document.querySelector(sel);
const show = (el) => el?.classList.remove('hidden');
const hide = (el) => el?.classList.add('hidden');

let chatHistory = [];
let currentUser = null;

// LOADING
function setLoading(active, text = 'Procesando...') {
  const overlay = $('#loading-overlay');
  $('#loading-text').textContent = text;
  active ? show(overlay) : hide(overlay);
}

// STATUS MESSAGES
function showStatus(el, type, msg) {
  el.className = `status ${type}`;
  el.textContent = msg;
  show(el);
  setTimeout(() => hide(el), 6000);
}

// API HELPERS
async function api(path, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
}

// INIT
async function init() {
  try {
    currentUser = await api('/api/me');
    renderUser(currentUser);
    show($('#main-app'));
    hide($('#login-screen'));
  } catch {
    hide($('#main-app'));
    show($('#login-screen'));
  }
}

function renderUser(user) {
  $('#user-name').textContent = user.name;
  $('#user-email').textContent = user.email || '';
  const avatar = $('#user-avatar');
  if (user.picture) {
    avatar.src = user.picture;
  } else {
    avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0A66C2&color=fff`;
  }
}

// TABS
document.querySelectorAll('.nav-item').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const tab = link.dataset.tab;
    document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    link.classList.add('active');
    $(`#tab-${tab}`).classList.add('active');
  });
});

// LOGOUT
$('#logout-btn').addEventListener('click', async () => {
  await api('/api/logout');
  location.reload();
});

// ─── TAB COMPOSE ─────────────────────────────────────────────────────────────

const postDraft = $('#post-draft');
const charCount = $('#post-char-count');

postDraft.addEventListener('input', () => {
  const len = postDraft.value.length;
  charCount.textContent = `${len} / 3000 caracteres`;
  charCount.style.color = len > 2800 ? '#cc1016' : '#666';
});

$('#generate-post-btn').addEventListener('click', async () => {
  const topic = $('#post-topic').value.trim();
  if (!topic) { alert('Por favor ingresa un tema para el post'); return; }

  setLoading(true, 'Generando post con IA...');
  try {
    const data = await api('/api/ai/generate-post', 'POST', {
      topic,
      tone: $('#post-tone').value,
      context: $('#post-context').value.trim()
    });
    postDraft.value = data.post;
    postDraft.dispatchEvent(new Event('input'));
  } catch (err) {
    alert(`Error: ${err.message}`);
  } finally {
    setLoading(false);
  }
});

$('#improve-post-btn').addEventListener('click', () => {
  const section = $('#improve-instructions');
  section.classList.toggle('hidden');
});

$('#improve-submit-btn').addEventListener('click', async () => {
  const draft = postDraft.value.trim();
  if (!draft) { alert('El borrador está vacío'); return; }

  setLoading(true, 'Mejorando post con IA...');
  try {
    const data = await api('/api/ai/improve-post', 'POST', {
      draft,
      instructions: $('#improve-text').value.trim()
    });
    postDraft.value = data.improved;
    postDraft.dispatchEvent(new Event('input'));
    hide($('#improve-instructions'));
  } catch (err) {
    alert(`Error: ${err.message}`);
  } finally {
    setLoading(false);
  }
});

$('#publish-post-btn').addEventListener('click', async () => {
  const text = postDraft.value.trim();
  if (!text) { alert('El borrador está vacío'); return; }
  if (!confirm('¿Publicar este post en LinkedIn?')) return;

  setLoading(true, 'Publicando en LinkedIn...');
  const status = $('#compose-status');
  try {
    const data = await api('/api/posts/text', 'POST', {
      text,
      visibility: $('#post-visibility').value
    });
    showStatus(status, 'success', `✅ ${data.message}`);
    postDraft.value = '';
    postDraft.dispatchEvent(new Event('input'));
  } catch (err) {
    showStatus(status, 'error', `❌ ${err.message}`);
  } finally {
    setLoading(false);
  }
});

// ─── TAB COMMENT ─────────────────────────────────────────────────────────────

$('#suggest-comment-btn').addEventListener('click', async () => {
  const postText = $('#comment-post-text').value.trim();
  if (!postText) { alert('Pega el texto del post primero'); return; }

  setLoading(true, 'Generando sugerencias...');
  try {
    const data = await api('/api/ai/suggest-comment', 'POST', {
      postText,
      angle: $('#comment-angle').value
    });

    const container = $('#suggestions-list');
    container.innerHTML = '';

    const lines = data.suggestions.split('\n').filter(l => l.trim());
    const suggestions = [];
    let current = '';

    lines.forEach(line => {
      if (/^[123][\.\)]/.test(line.trim())) {
        if (current) suggestions.push(current.trim());
        current = line.replace(/^[123][\.\)]\s*/, '');
      } else {
        current += ' ' + line;
      }
    });
    if (current) suggestions.push(current.trim());

    if (suggestions.length === 0) suggestions.push(data.suggestions);

    suggestions.forEach((s, i) => {
      const div = document.createElement('div');
      div.className = 'suggestion-item';
      div.innerHTML = `
        <div class="suggestion-text">${s}</div>
        <button class="btn btn-secondary use-suggestion-btn" style="font-size:12px; padding:6px 12px">
          Usar este comentario
        </button>`;
      div.querySelector('.use-suggestion-btn').addEventListener('click', () => {
        $('#comment-text').value = s;
        div.querySelector('.use-suggestion-btn').textContent = '✅ Seleccionado';
      });
      container.appendChild(div);
    });

    show($('#comment-suggestions'));
  } catch (err) {
    alert(`Error: ${err.message}`);
  } finally {
    setLoading(false);
  }
});

$('#publish-comment-btn').addEventListener('click', async () => {
  const postUrn = $('#comment-post-urn').value.trim();
  const text = $('#comment-text').value.trim();
  if (!postUrn || !text) { alert('Completa el URN del post y el comentario'); return; }
  if (!confirm('¿Publicar este comentario?')) return;

  setLoading(true, 'Publicando comentario...');
  const status = $('#comment-status');
  try {
    const data = await api('/api/posts/comment', 'POST', { postUrn, text });
    showStatus(status, 'success', `✅ ${data.message}`);
    $('#comment-text').value = '';
  } catch (err) {
    showStatus(status, 'error', `❌ ${err.message}`);
  } finally {
    setLoading(false);
  }
});

// ─── TAB SHARE ───────────────────────────────────────────────────────────────

let evaluatedPost = '';

$('#evaluate-btn').addEventListener('click', async () => {
  const summary = $('#share-summary').value.trim();
  const url = $('#share-url').value.trim();
  if (!summary && !url) { alert('Describe el contenido que quieres evaluar'); return; }

  setLoading(true, 'Evaluando contenido con IA...');
  try {
    const result = await api('/api/ai/evaluate-share', 'POST', { contentUrl: url, contentSummary: summary });

    const resultDiv = $('#evaluation-result');
    const badge = $('#eval-score-badge');
    const score = result.score || 0;

    badge.textContent = `Puntuación: ${score}/10`;
    badge.className = 'score-badge ' + (score >= 7 ? 'score-high' : score >= 4 ? 'score-mid' : 'score-low');

    $('#eval-verdict').textContent = result.worth_sharing ? '✅ Vale la pena compartir' : '❌ No recomendado para compartir';
    $('#eval-reason').textContent = result.reason;

    const postSection = $('#eval-post-section');
    if (result.worth_sharing && result.post) {
      evaluatedPost = result.post;
      $('#eval-post-preview').textContent = result.post;
      show(postSection);
    } else {
      hide(postSection);
    }

    show(resultDiv);
  } catch (err) {
    alert(`Error: ${err.message}`);
  } finally {
    setLoading(false);
  }
});

$('#eval-edit-btn').addEventListener('click', () => {
  // Copiar a la pestaña de compose
  $('#post-draft').value = evaluatedPost;
  $('#post-draft').dispatchEvent(new Event('input'));
  document.querySelector('[data-tab="compose"]').click();
});

$('#eval-publish-btn').addEventListener('click', async () => {
  if (!evaluatedPost || !confirm('¿Publicar este post en LinkedIn?')) return;

  setLoading(true, 'Publicando en LinkedIn...');
  const status = $('#share-status');
  try {
    const data = await api('/api/posts/text', 'POST', { text: evaluatedPost, visibility: 'PUBLIC' });
    showStatus(status, 'success', `✅ ${data.message}`);
  } catch (err) {
    showStatus(status, 'error', `❌ ${err.message}`);
  } finally {
    setLoading(false);
  }
});

// ─── TAB POSTS ───────────────────────────────────────────────────────────────

$('#refresh-posts-btn').addEventListener('click', async () => {
  setLoading(true, 'Cargando tus posts...');
  const container = $('#posts-list');
  const status = $('#posts-status');
  container.innerHTML = '';

  try {
    const data = await api('/api/posts/mine');
    if (!data.posts || data.posts.length === 0) {
      container.innerHTML = '<div class="card"><p style="color:#666;text-align:center">No se encontraron posts recientes.</p></div>';
      return;
    }

    data.posts.forEach(post => {
      const div = document.createElement('div');
      div.className = 'post-item';
      const date = post.created ? new Date(post.created).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Fecha desconocida';
      div.innerHTML = `
        <div class="post-item-text">${escapeHtml(post.text || '(Sin texto)')}</div>
        <div class="post-item-meta">
          <span>📅 ${date}</span>
          <span>👁 ${post.visibility || 'PUBLIC'}</span>
          <span>• ${post.lifecycleState || ''}</span>
        </div>`;
      container.appendChild(div);
    });
  } catch (err) {
    showStatus(status, 'error', `❌ ${err.message}`);
  } finally {
    setLoading(false);
  }
});

// ─── TAB CHAT ────────────────────────────────────────────────────────────────

async function sendChat() {
  const input = $('#chat-input');
  const msg = input.value.trim();
  if (!msg) return;

  appendMessage('user', msg);
  chatHistory.push({ role: 'user', content: msg });
  input.value = '';

  const sendBtn = $('#chat-send-btn');
  sendBtn.disabled = true;
  sendBtn.textContent = '...';

  try {
    const data = await api('/api/ai/chat', 'POST', {
      messages: chatHistory.slice(-10),
      userMessage: msg
    });
    appendMessage('assistant', data.reply);
    chatHistory.push({ role: 'assistant', content: data.reply });
  } catch (err) {
    appendMessage('assistant', `Error: ${err.message}`);
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = 'Enviar';
  }
}

function appendMessage(role, text) {
  const messages = $('#chat-messages');
  const div = document.createElement('div');
  div.className = `message ${role}-message`;
  div.innerHTML = `<strong>${role === 'user' ? 'Tú' : 'Asistente'}</strong><p>${escapeHtml(text)}</p>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

$('#chat-send-btn').addEventListener('click', sendChat);
$('#chat-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); }
});

// UTILS
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// START
init();
