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

GitHub Actions runs the following workflows on pushes to `main`, pull requests to `main`, and manual dispatch:

- `.github/workflows/lint.yml` checks the client and server with `npm run lint`.
- `.github/workflows/build.yml` builds the Vite client and validates/loads the Express backend.
- `.github/workflows/api-test.yml` starts MongoDB 7, seeds profile records, then runs CRUD, validation, authentication, and authorization tests with an ephemeral JWT secret.
- `.github/workflows/test.yml` is the `Test` workflow. It calls the lint, build, and API test workflows and also runs coverage and recorded Playwright E2E tests against MongoDB 7. All jobs must succeed for the workflow to pass. The individual workflows also run independently on their existing triggers, so those checks are duplicated.
- `.github/workflows/deploy.yml` runs after successful `Test` completion for a push to `main` and requests deployment of the tested commit to both Render services. It skips pull requests, manual test runs, failures, and commits no longer at the tip of `main`. GitHub requires the deploy workflow file to exist on the default branch for `workflow_run` to trigger. A successful hook request means the deploy was accepted, not that it finished successfully; check Render's deploy logs. The gate controls these Render hooks; any separate automatic deployment integration must be configured independently.

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

## Test coverage

With dependencies installed and Node 26 selected, run:

```sh
npm run coverage:client
MONGODB_DB_NAME=PortfolioE2E JWT_SECRET=isolated-local-test-secret-at-least-32-characters node --env-file=.env "$(command -v npm)" run coverage:server
```

The server command requires an explicit `MONGODB_URI` and the isolated `PortfolioE2E` database name. Use a test-only MongoDB cluster or user, not production credentials. It runs the Node unit tests and HTTP integration suite; the latter creates and removes temporary records. The test database must be reachable and allow writes. Do not share the `.env` file.

The client report covers application JavaScript and JSX under `client/src`, excluding test files. The server report covers `server.js`, `server/**/*.js`, and `config/**/*.js`; tests and scripts are not included in the denominator. Each command enforces at least 90% line and branch coverage, and the release workflow uploads both reports as an artifact. The browser E2E run is not instrumented by these reports. View `coverage/client/index.html` and `coverage/server/index.html` locally. Coverage percentages describe which lines and branches were exercised, not proof that the application is defect-free.

The frontend repositories each have a corresponding `*.test.js` file. `client/e2e/interfaces.spec.js` checks all ten screens at desktop and mobile sizes, verifies that their images load, and captures screenshots in `client/test-results/` and the Playwright HTML report. Selected screenshots from a local run are saved separately in `evidence/interface-tests/`; they do not update automatically when tests are rerun. The interface test uses controlled API responses and a simulated administrator session, so it is not evidence of deployed API or authentication behavior. Run it with `npm run test:e2e --prefix client -- interfaces.spec.js` after building the client and configuring the isolated MongoDB test database required by the Playwright server. The separate contact E2E test uses the real API and database.

The Postman collection at `docs/MyPortfolio.postman_collection.json` covers welcome/health, sign-up/sign-in/sign-out, and CRUD requests for all four resources. In Postman, set `baseUrl` to `http://localhost:5000`; set `adminEmail` and `adminPassword` from your private `.env` values. Capture screenshots showing each request, response body, and HTTP status for the assignment. Do not include the password or token in screenshots.

## Assignment evidence

The `evidence/` folder contains selected screenshots for the assignment. The Word document is prepared separately and is not included in the repository. Review screenshots for private information before sharing or committing them: do not include `.env`, credentials, password hashes, or JWT values.

The `npm run evidence` script targets an earlier set of screenshots and cannot regenerate the current document from the renamed files. Do not run it against the current evidence folder: its output could overwrite a Word document there.

## Assignment 4: tests and performance

The contact-form unit tests cover validation, successful submission, and API errors. The Playwright test submits the real form to the Express API, verifies the saved document in MongoDB, and removes that specific test document. All Playwright tests record 1280×720 WebM videos and use `slowMo: 1000` to slow Playwright browser operations for readability; this does not add a one-second pause after ordinary JavaScript operations or assertions. Interface tests retain their desktop and mobile viewport sizes, which are scaled to fit the video frame. Screenshots and recordings are saved under `client/test-results/`. These files are ignored by Git and are replaced on the next E2E run; copy the evidence you need before rerunning. The slowdown applies in CI too, so E2E runs take longer.

Use Node 26 and install dependencies as described above. For E2E, configure a MongoDB URI in the root `.env` or `MONGODB_URI` environment variable. The E2E server and direct database assertion always use a separate database named `PortfolioE2E`, regardless of `MONGODB_DB_NAME`; the MongoDB account must be allowed to read and write it.

```sh
npm test --prefix client
node --test tests/date-range.test.js
cd client && npx playwright install --with-deps chromium && cd ..
VITE_API_BASE_URL=http://127.0.0.1:5001 npm run build --prefix client
npm run test:e2e --prefix client
```

The E2E runner starts its own API on port 5001 and production preview on port 4173; both ports must be free. To use an already installed local Chrome instead of Playwright's Chromium, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its absolute executable path. Playwright's FFmpeg is still required for video recording.

For the performance improvement, secondary routes are loaded on demand rather than included in the initial home-page bundle. In one local Chrome measurement of the production preview, the encoded JavaScript resources requested on the home page fell from 144,781 to 128,537 bytes (11.2%). This is a transfer-size comparison, not a claim about a statistically significant page-load-time improvement; results vary by browser, cache, network, and deployment.

## Render deployment

`render.yaml` defines a free Node web service for the API and a static frontend. Render's free web service sleeps after inactivity and can take around a minute to wake; free usage and build-minute limits apply. MongoDB remains on Atlas. Review current [Render free-tier limits](https://render.com/docs/free) and [Atlas free-tier limits](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/) before provisioning.

1. Connect the repository to Render and create a Blueprint from `render.yaml` on the intended release branch. The initial Blueprint deployment occurs before the GitHub Actions deploy gate; verify the selected commit before provisioning.
2. Provide `MONGODB_URI` privately in the API service. Render generates `JWT_SECRET`. Set `CLIENT_ORIGIN` to the exact HTTPS frontend origin and `VITE_API_BASE_URL` to the exact HTTPS API origin. If the assigned Render URLs are not yet known at creation, update these values in Render afterward and manually redeploy both services. The frontend value is embedded at build time.
3. Configure Atlas network access so the API can connect, and use a database user limited to the required database and privileges. Render's free outbound IP addresses can change; an Atlas allow-all network rule, if needed, exposes the database endpoint to the internet and requires strong credentials and careful access control. Never put the URI, credentials, or JWT secret in Git or screenshots.
4. Seed the intended production database using the existing seed commands and private environment values, then verify the public pages, contact form, sign-in, authorization, and CRUD. Use dedicated test records and remove them after testing.
5. In GitHub Actions repository secrets, set `RENDER_API_DEPLOY_HOOK` and `RENDER_WEB_DEPLOY_HOOK` to the respective secret deploy-hook URLs from Render. Both services have automatic deploys disabled in the Blueprint; the separate deploy workflow triggers the hooks after the `Test` workflow succeeds for a push to `main`. Hook responses indicate that Render accepted or queued the deploy, so confirm completion and the deployed commit in Render.

The E2E and unit tests were created with AI assistance and must be reviewed, understood, and validated by the student before submission. The local tests do not establish that the deployed application works; record separate deployed-environment and CI/CD evidence once the services are live.