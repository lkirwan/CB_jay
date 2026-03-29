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
- `.do/app.yaml`

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
2. Create an App Platform app configured to use the pre-built image from DOCR (see [App Platform spec](#app-platform-spec) below).
3. Add the three secrets above to **Settings → Secrets and variables → Actions** in the GitHub repository.

### App Platform spec

The App Platform app **must** be configured to pull the pre-built image from DOCR rather than build from source.  Without this, App Platform skips the build step but cannot find the correct image to deploy.

The canonical spec is stored in [`.do/app.yaml`](../.do/app.yaml).  It uses `${DIGITALOCEAN_REGISTRY_NAME}` as a placeholder for the registry name.  To apply it to your App Platform app, run once after any manual changes:

```bash
DIGITALOCEAN_REGISTRY_NAME=<your-registry-name> \
  envsubst < .do/app.yaml | \
  doctl apps update <APP_ID> --spec -
```

The key section of the spec that configures the pre-built DOCR image is:

```yaml
services:
  - name: backend
    image:
      registry_type: DOCR
      registry: <YOUR_REGISTRY_NAME>   # the part after registry.digitalocean.com/
      repository: backend              # image name only — no registry prefix
      tag: latest
    http_port: 8080
```

> **Note on `deploy_on_push`**: The spec intentionally omits `deploy_on_push` so that the GitHub Actions workflow is the single source of deployment triggers.  Combining `deploy_on_push` with the workflow's explicit `doctl apps create-deployment --wait` would start two deployments on every push.

Every time the workflow runs it pushes a new `latest` tag to DOCR and then calls `doctl apps create-deployment --wait` to trigger App Platform to pull and deploy that image.

## Notes

- The frontend Nginx config proxies `/api/*` to the `backend` service.
- Backend data persists in Docker volume `backend-data` in `docker-compose.prod.yml`.
- For public internet deployment, place a TLS reverse proxy in front (for example Caddy, Nginx, Traefik, or a cloud load balancer).

