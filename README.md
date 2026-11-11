# MyPortfolio — Assignment 2

MERN portfolio with a React/Vite client, an Express/Mongoose REST API, and JWT authentication.

## Repository layout

- The repository root is Assignment 2: `client/`, `server/`, and the root `package.json`.
- `client/` contains the portfolio frontend. The original Assignment 1 files remain recoverable from the repository's earlier Git history.

## Requirements

- Node.js 26 (`.nvmrc`) and npm 10+
- A MongoDB Atlas cluster and database user

Vercel currently requires Node.js 24.x for its build runtime. The root `package.json` declares 24.x so Vercel accepts deployments; local development and CI remain on Node.js 26 to satisfy the course requirement. The app has been checked under both versions.

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
- The Vite client is also allowed at `http://127.0.0.1:5173`; if using another client origin, add it to the comma-separated `CLIENT_ORIGIN` value in `.env` and restart the API.
- API: `http://localhost:5000`
- Welcome response: `GET http://localhost:5000/`

## REST API

All resource routes use `/api` and return JSON errors with appropriate status codes.

| Resource | Routes | Access |
| --- | --- | --- |
| Contacts | `GET/POST /api/contacts`, `GET/PUT/DELETE /api/contacts/:id` | Create is public; reads require a JWT; mutations require admin JWT |
| Projects | `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/:id` | Reads are public; mutations require admin JWT |
| Qualifications | `GET/POST /api/qualifications`, `GET/PUT/DELETE /api/qualifications/:id` | Reads are public; mutations require admin JWT |
| Users | `GET/POST /api/users`, `GET/PUT/DELETE /api/users/:id` | Admin JWT required |
| Authentication | `POST /api/auth/signup`, `/api/auth/signin`, `/api/auth/signout` | Sign-out requires JWT |

Send protected requests with `Authorization: Bearer <access-token>`. Public sign-up always creates the `user` role; role assignment is only available through admin-protected user CRUD. Passwords are bcrypt-hashed and omitted from responses. Access tokens expire according to `JWT_EXPIRES_IN`; sign-out is stateless, so clients must discard their token.

## Frontend integration

The React client routes every API request through the resource repositories under `client/src/repositories/`: authentication, contacts, projects, and qualifications. The shared `apiClient.js` handles JSON requests and Bearer tokens. The dashboard (`/dashboard`) requires sign-in; regular users can read contact submissions, projects, and qualifications, while only admins can create, edit, or delete records. Contact submissions remain public.

Authentication tokens and the minimal user profile are stored in `sessionStorage`, so they are cleared when the browser tab session ends. Sign-out discards the local token immediately and also asks the API to confirm the stateless sign-out. As with any JavaScript-accessible token storage, protect the client against script injection and never put tokens in screenshots or source control. For a deployed frontend, set `VITE_API_BASE_URL` to the backend origin; local development defaults to `http://localhost:5000`.

Create a regular account at `/sign-up`, then sign in at `/sign-in`. The seeded administrator uses the private environment values documented above; public registration cannot grant the admin role.

Visitors who open `/dashboard` without a session are redirected to `/unauthorized`, where they can continue to sign in. The previous `/admin` address redirects to `/dashboard`. Expired sessions are cleared when the dashboard checks access, and the visitor is redirected to the same sign-in prompt.

Signing out immediately clears the local session and opens `/sign-in`. The API sign-out request is sent using the former token; a failure is reported without restoring the local session. Because JWT sign-out is stateless, an independently retained token remains valid until it expires.

Administrators can view registered users in the dashboard and, after confirmation, promote a user or remove another administrator's access. An administrator cannot remove their own administrator access. The API checks the current database role on every request, so role changes take effect immediately for authorization; the dashboard refreshes its role on load and when the window regains focus. User management is available only to administrators, and password hashes are never returned by the user API.

Project and qualification forms use a required start date for new records and an optional end date. Dates are stored as calendar-date strings (`YYYY-MM-DD`); an empty end date means it is not specified, not necessarily that the work is still in progress. The API validates both dates and their order. Existing `completionDate` values remain readable and are not automatically converted: they can contain an imprecise year or range. Editing an old record preserves that value; entering a start date switches the displayed period to the new fields.

## Seed and API tests

```sh
npm run seed:portfolio
npm run seed:admin
npm run test:api
```

`test:api` runs real HTTP requests against MongoDB, checks CRUD/validation/JWT authorization and password privacy, then deletes its temporary test records. It requires a working `MONGODB_URI` and local `JWT_SECRET` in `.env`.

The Postman collection at `docs/MyPortfolio.postman_collection.json` covers welcome/health, sign-up/sign-in/sign-out, and CRUD requests for all four resources. In Postman, set `baseUrl` to `http://localhost:5000`; set `adminEmail` and `adminPassword` from your private `.env` values. Capture screenshots showing each request, response body, and HTTP status for the assignment. Do not include the password or token in screenshots.

## Assignment evidence

The `evidence/` folder contains selected screenshots for the assignment. The Word document is prepared separately and is not included in the repository. Review screenshots for private information before sharing or committing them: do not include `.env`, credentials, password hashes, or JWT values.

The `npm run evidence` script targets an earlier set of screenshots and cannot regenerate the current document from the renamed files. Do not run it against the current evidence folder: its output could overwrite a Word document there.