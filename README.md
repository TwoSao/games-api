# games-api

REST API for managing a games catalogue, built with **Node.js** and **Express**, with interactive **Swagger** documentation.

## Endpoints
| Method | Route | Access |
|---|---|---|
| GET | `/games` | public |
| GET | `/games/:id` | public |
| POST | `/games` | authenticated |
| PUT | `/games/:id` | admin |
| DELETE | `/games/:id` | admin |

Interactive docs are served at `/docs`.

## Getting started
```bash
git clone https://github.com/TwoSao/games-api.git
cd games-api
npm install
cp .env.example .env
node index.js
```

## Tech stack
Node.js · Express 5 · Swagger UI · dotenv
