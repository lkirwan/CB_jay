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
