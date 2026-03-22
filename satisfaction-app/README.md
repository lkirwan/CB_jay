# Satisfaction App

React + Vite frontend for the CB Jay satisfaction project.

This app now uses a separate Spring Boot API backend (`../backend`) for:

- offerings and ratings persistence
- facilitator authentication
- offering status and lifecycle date updates

## Requirements

- Node.js 20+ recommended
- npm (this repo includes a `package-lock.json`)

## Install

From the `satisfaction-app` folder:

```bash
npm install
```

## Run in non-prod

Use the Vite development server for local development:

```bash
npm run dev
```

This starts the app in development mode with hot reloading.

For full functionality, the backend should also be running on `http://localhost:8080`.

## Run for PROD

Create an optimized production build:

```bash
npm run build
```

The production-ready files are generated in `dist/`.

## Preview the PROD build locally

After building, serve the production bundle locally to verify it before deployment:

```bash
npm run preview
```

## Environment notes

The frontend calls API paths through `VITE_API_BASE_URL` (defaults to `/api`).

During local development, Vite proxies `/api` to `http://localhost:8080`.

You can override the API base URL with a local env file:

```bash
cp .env.example .env.local
```

## Common workflow

```bash
cd ../backend
mvn spring-boot:run
```

In another terminal:

```bash
cd satisfaction-app
npm install
npm run dev
```

For a production-style check:

```bash
npm install
npm run build
npm run preview
```
