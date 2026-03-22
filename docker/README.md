# Docker Deliverables

This folder documents containerized workflows for `backend/` and `satisfaction-app/`.

## Files created

- `backend/Dockerfile`
- `backend/.dockerignore`
- `satisfaction-app/Dockerfile`
- `satisfaction-app/.dockerignore`
- `satisfaction-app/nginx/default.conf`
- `docker-compose.dev.yml`
- `docker-compose.prod.yml`

## Development (Docker Compose)

Starts:
- Spring Boot backend on `http://localhost:8080`
- Vite dev server on `http://localhost:5173`

```bash
cd /home/lkirwan/myProjects/development/CB_jay
docker compose -f docker-compose.dev.yml up --build
```

Stop and remove containers:

```bash
cd /home/lkirwan/myProjects/development/CB_jay
docker compose -f docker-compose.dev.yml down
```

## Production-style local run (Docker Compose)

Starts:
- Nginx-served frontend on `http://localhost`
- Backend only on internal Docker network

```bash
cd /home/lkirwan/myProjects/development/CB_jay
APP_FRONTEND_ORIGIN=http://localhost \
APP_FACILITATOR_PASSWORD=change-me-now \
APP_JWT_SECRET=replace-with-a-long-random-secret \
docker compose -f docker-compose.prod.yml up --build -d
```

Stop:

```bash
cd /home/lkirwan/myProjects/development/CB_jay
docker compose -f docker-compose.prod.yml down
```

## Quick checks

```bash
curl -i http://localhost/api/public/offerings
curl -i -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"change-me-now"}'
```

## DigitalOcean deployment (GitHub Actions)

Merging a PR into `main` automatically builds the backend Docker image, pushes it to the DigitalOcean Container Registry (DOCR), and triggers a new App Platform deployment via `.github/workflows/deploy-backend.yml`.

### Required GitHub repository secrets

| Secret | Description |
|---|---|
| `DIGITALOCEAN_ACCESS_TOKEN` | Personal access token created in the DigitalOcean control panel (API → Tokens) with read/write scope. |
| `DIGITALOCEAN_REGISTRY_NAME` | Name of your DOCR registry (the part after `registry.digitalocean.com/`). |
| `DIGITALOCEAN_APP_ID` | App Platform application ID, found with `doctl apps list` or in the App Platform URL. |

### One-time setup

1. Create a registry: `doctl registry create <name>`
2. Create an App Platform app that uses the `backend` image from DOCR.
3. Add the three secrets above to **Settings → Secrets and variables → Actions** in the GitHub repository.

## Notes

- The frontend Nginx config proxies `/api/*` to the `backend` service.
- Backend data persists in Docker volume `backend-data` in `docker-compose.prod.yml`.
- For public internet deployment, place a TLS reverse proxy in front (for example Caddy, Nginx, Traefik, or a cloud load balancer).

