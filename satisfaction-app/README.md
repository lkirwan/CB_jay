# Satisfaction App

React + Vite frontend for the client satisfaction feedback project.

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

This app does not currently include any checked-in environment files.

If you need environment-specific values later, use Vite's standard file names:

- `.env.development` for non-prod/local development values
- `.env.production` for production build values

Only variables prefixed with `VITE_` are exposed to the React app.

## Common workflow

```bash
npm install
npm run dev
```

For a production-style check:

```bash
npm install
npm run build
npm run preview
```
