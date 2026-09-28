# Maya Laurent — Portfolio

A bilingual React portfolio for Maya Laurent, a fictional frontend developer with four years of experience. This is a client-side assignment demo: contact-form values are validated, discarded, and never sent or stored.

## Run locally

Requirements: Node.js 20.19+ or 22.12+, npm 10+.

```sh
npm install
npm run dev
```

## Checks and assets

```sh
npm run lint
npm run build
npm run resume
```

`npm run resume` reproducibly generates the fictional one-page résumé at `public/maya-laurent-resume.pdf`.

## Structure

- `src/constants/routes.js` is the single source of route paths. `BrowserRouter` wraps the app in `src/main.jsx`, and `src/App.jsx` maps the constants to the six page views.
- `src/pages/` contains Home, About, Projects, Education, Services and Contact.
- `src/i18n/` contains English/French interface and profile copy. The browser language is detected initially; the language selector remembers a manual choice locally.
- Tailwind CSS v4 is integrated through Vite. shadcn/ui components use Radix primitives, JavaScript/JSX, and the `@/` source alias.
- ESLint is configured in `eslint.config.js`; run it with `npm run lint`.

## Publish on Vercel

1. Create or sign in to your own Vercel account.
2. Once you decide to publish the GitHub repository, import it into Vercel, or deploy from this folder with the Vercel CLI.
3. Use the Vite defaults: build command `npm run build` and output directory `dist`.
4. `vercel.json` rewrites direct visits to client-side routes to the SPA entry point.
5. Open `/about`, `/projects`, `/education`, `/services` and `/contact` directly on the deployed URL to verify rewrites.

No GitHub remote or push is configured by this setup. Publish the repository yourself when ready, then add your repository and live-site links to the assignment submission.

## Fictional profile

Maya Laurent, Lyon, France · `maya.laurent@example.com` · fictional education, projects, outcomes and résumé. Project photography is loaded from Unsplash.
