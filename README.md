# LinkedIn Assistant

Asistente inteligente para gestionar tu presencia en LinkedIn. Genera posts con IA, sugiere comentarios, evalúa contenido para compartir y publica directamente en LinkedIn.

## Funcionalidades

- **Crear Post** — genera borradores desde un tema con tono personalizable, mejora borradores propios y publica directo en LinkedIn
- **Comentar** — pega el texto de un post y obtén 3 sugerencias de comentarios con distintos ángulos
- **Compartir** — describe un artículo o contenido y la IA lo evalúa con puntuación y genera el post para compartirlo
- **Mis Posts** — historial de publicaciones realizadas desde la app
- **Chat IA** — conversación abierta sobre estrategia de LinkedIn, ideas de contenido y networking

## Tecnologías

- **Backend:** Node.js + Express
- **IA:** Claude (Anthropic API)
- **Auth:** LinkedIn OAuth 2.0 (OpenID Connect)
- **Arquitectura:** Controladores / Servicios / Rutas separados

## Estructura del proyecto

```
src/
├── config/         # Variables de entorno y configuración
├── controllers/    # Lógica de cada endpoint
├── middleware/     # Autenticación de sesión
├── routes/         # Definición de rutas
└── services/       # LinkedIn API, Claude AI, caché de posts
public/             # Frontend (HTML, CSS, JS)
server.js           # Punto de entrada
```

## Instalación local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/barriamatus/linkedin-assistant.git
   cd linkedin-assistant
   ```

2. Instala dependencias:
   ```bash
   npm install
   ```

3. Copia el archivo de entorno y completa las variables:
   ```bash
   cp .env.example .env
   ```

4. Inicia el servidor:
   ```bash
   npm start
   ```

5. Abre [http://localhost:3000](http://localhost:3000)

## Variables de entorno

| Variable | Descripción |
|---|---|
| `LINKEDIN_CLIENT_ID` | Client ID de tu app en LinkedIn Developers |
| `LINKEDIN_CLIENT_SECRET` | Client Secret de tu app |
| `LINKEDIN_REDIRECT_URI` | URL de callback (ej: `http://localhost:3000/auth/callback`) |
| `ANTHROPIC_API_KEY` | API Key de Anthropic (console.anthropic.com) |
| `SESSION_SECRET` | String aleatorio para firmar sesiones |
| `PORT` | Puerto del servidor (por defecto: 3000) |

## Configuración de LinkedIn

1. Crea una app en [linkedin.com/developers/apps/new](https://www.linkedin.com/developers/apps/new)
2. En la pestaña **Products**, agrega:
   - Sign In with LinkedIn using OpenID Connect
   - Share on LinkedIn
3. En la pestaña **Auth**, agrega tu URL de callback en *Authorized redirect URLs*

## Despliegue en Railway

El proyecto está configurado para desplegarse automáticamente en Railway.

1. Conecta el repositorio en [railway.app](https://railway.app)
2. Configura las variables de entorno en Settings → Variables
3. Actualiza `LINKEDIN_REDIRECT_URI` con la URL de Railway
4. Agrega esa misma URL en LinkedIn Developers → Auth → Authorized redirect URLs

## Licencia

MIT
