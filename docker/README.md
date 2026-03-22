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

## Notes

- The frontend Nginx config proxies `/api/*` to the `backend` service.
- Backend data persists in Docker volume `backend-data` in `docker-compose.prod.yml`.
- For public internet deployment, place a TLS reverse proxy in front (for example Caddy, Nginx, Traefik, or a cloud load balancer).

