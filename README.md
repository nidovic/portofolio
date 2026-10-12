# MyPortfolio — Assignment 2

MERN portfolio with a React/Vite client, an Express/Mongoose REST API, and JWT authentication.

## Repository layout

- The repository root is Assignment 2: `client/`, `server/`, and the root `package.json`.
- `client/` contains the portfolio frontend. The original Assignment 1 files remain recoverable from the repository's earlier Git history.

## Requirements

- Node.js 26 (`.nvmrc`) and npm 10+
- A MongoDB Atlas cluster and database user

## Continuous integration

GitHub Actions uses three independent workflows on pushes to `main`, pull requests to `main`, and manual dispatch:

- `.github/workflows/lint.yml` checks the client and server with `npm run lint`.
- `.github/workflows/build.yml` builds the Vite client and validates/loads the Express backend.
- `.github/workflows/api-test.yml` starts MongoDB 7, seeds profile records, then runs CRUD, validation, authentication, and authorization tests with an ephemeral JWT secret.

## Local setup

```sh
nvm use
npm install
npm ci --prefix client
cp .env.example .env
```

Generate a local JWT secret without sharing or committing it:

```sh
openssl rand -hex 32
```

Paste the generated value into `JWT_SECRET` in `.env`. Set a private `ADMIN_PASSWORD` of at least 12 characters there too. Never commit `.env` or include it in screenshots.

## MongoDB Atlas

Create a database user in Atlas and allow your current development IP in Network Access. Copy the Drivers connection string into the local `.env` as `MONGODB_URI`, replacing its username and password and selecting the `Portfolio` database. The credentials previously pasted in chat should be rotated before use. Do not share the new URI, place it in screenshots, or commit `.env`.

Seed the profile projects/qualification and create the administrator account:

```sh
npm run seed:portfolio
npm run seed:admin
```

The portfolio seed uses upserts by slug and does not clear existing collections. Start both applications together:

```sh
npm run dev
```

- Client: `http://localhost:5173`
- API: `http://localhost:5000`
- Welcome response: `GET http://localhost:5000/`

## REST API

All resource routes use `/api` and return JSON errors with appropriate status codes.

| Resource | Routes | Access |
| --- | --- | --- |
| Contacts | `GET/POST /api/contacts`, `GET/PUT/DELETE /api/contacts/:id` | Create is public; reads and mutations require admin JWT |
| Projects | `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/:id` | Reads are public; mutations require admin JWT |
| Qualifications | `GET/POST /api/qualifications`, `GET/PUT/DELETE /api/qualifications/:id` | Reads are public; mutations require admin JWT |
| Users | `GET/POST /api/users`, `GET/PUT/DELETE /api/users/:id` | Admin JWT required |
| Authentication | `POST /api/auth/signup`, `/api/auth/signin`, `/api/auth/signout` | Sign-out requires JWT |

Send protected requests with `Authorization: Bearer <access-token>`. Public sign-up always creates the `user` role; role assignment is only available through admin-protected user CRUD. Passwords are bcrypt-hashed and omitted from responses. Access tokens expire according to `JWT_EXPIRES_IN`; sign-out is stateless, so clients must discard their token.

## Seed and API tests

```sh
npm run seed:portfolio
npm run seed:admin
npm run test:api
npm run evidence
```

`test:api` runs real HTTP requests against MongoDB, checks CRUD/validation/JWT authorization and password privacy, then deletes its temporary test records. It requires a working `MONGODB_URI` and local `JWT_SECRET` in `.env`.

The Postman collection at `docs/MyPortfolio.postman_collection.json` covers welcome/health, sign-up/sign-in/sign-out, and CRUD requests for all four resources. In Postman, set `baseUrl` to `http://localhost:5000`; set `adminEmail` and `adminPassword` from your private `.env` values. Capture screenshots showing each request, response body, and HTTP status for the assignment. Do not include the password or token in screenshots.

## Assignment evidence

`npm run evidence` generates `evidence/Assignment2-Evidence.docx`. It includes the captured welcome/health/API-data/client-flow screenshots, live MongoDB collection counts, and the verified integration-test status matrix. Add your own MongoDB Compass screenshot and Postman request/response/status screenshots before submitting; the local document marks these items explicitly. Also capture the server console's successful MongoDB connection. Never include `.env`, credentials, passwords, or JWT values in evidence.