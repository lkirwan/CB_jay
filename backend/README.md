# CB Jay Backend API

Spring Boot backend for the CB Jay satisfaction tracker.

## Stack

- Java 21
- Spring Boot 3.4
- Spring Security + JWT
- Spring Data JPA
- H2 file database (`./data/cb_jay.mv.db`)

## One facilitator account

The backend seeds one facilitator account on startup from `application.yml`:

- `app.facilitator.username` (default: `facilitator`)
- `app.facilitator.password` (default: `manager`)

## Run locally

```bash
cd backend
mvn spring-boot:run
```

API base URL: `http://localhost:8080/api`

## Test/build

```bash
cd backend
mvn test
```

## Core endpoints

- `POST /api/auth/login` - facilitator login, returns JWT
- `GET /api/auth/me` - get current facilitator identity (requires JWT)
- `GET /api/public/offerings` - list active offerings for clients
- `POST /api/public/ratings` - submit a rating for an active offering
- `GET /api/offerings` - list all offerings (requires JWT)
- `POST /api/offerings` - create offering (requires JWT)
- `PATCH /api/offerings/{id}/status` - set `active` or `closed` (requires JWT)
- `GET /api/ratings` - list all ratings (requires JWT)

## Auth usage

Send the login response token as:

`Authorization: Bearer <jwt>`

The React app does this automatically via `satisfaction-app/src/lib/api.js`.

