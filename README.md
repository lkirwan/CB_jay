# CB_jay

Client satisfaction feedback project split into:

- `satisfaction-app/` - React + Vite frontend
- `backend/` - Spring Boot API with H2 + JWT security

## Run locally

Start backend:

```bash
cd backend
mvn spring-boot:run
```

Start frontend (separate terminal):

```bash
cd satisfaction-app
npm install
npm run dev
```

The frontend uses Vite proxying so `/api` requests go to `http://localhost:8080` during local development.

## Docker workflows

Run both apps with Docker Compose (development mode):

```bash
docker compose -f docker-compose.dev.yml up --build
```

Run a production-style local stack:

```bash
APP_FRONTEND_ORIGIN=http://localhost \
APP_FACILITATOR_PASSWORD=change-me-now \
APP_JWT_SECRET=replace-with-a-long-random-secret \
docker compose -f docker-compose.prod.yml up --build -d
```

More details: `docker/README.md`.
