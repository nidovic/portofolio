import { expect, test } from '@playwright/test'

const admin = { _id: 'admin-test', name: 'Test Administrator', email: 'admin@example.test', role: 'admin' }
const project = {
  _id: 'project-test',
  title: 'Portfolio project',
  description: 'A project used for interface tests.',
  category: 'Mobile',
  image: 'https://spreeloop.com/images/apps/place-logo.png',
  imageAlt: 'Project logo',
  imageKind: 'logo',
  stack: ['React', 'Node.js'],
  links: [{ type: 'github', url: 'https://github.com/nidovic/portofolio' }],
}
const qualification = {
  _id: 'qualification-test',
  title: 'Computer science',
  institution: 'Test College',
  location: 'Toronto',
  description: 'A qualification used for interface tests.',
}

const pages = [
  { name: 'home', path: '/', heading: /From app to cloud/ },
  { name: 'about', path: '/about', heading: /Lodovic Rothney Feutse Nziko/ },
  { name: 'projects', path: '/projects', heading: /Small details. Meaningful outcomes/ },
  { name: 'education', path: '/education', heading: /From computer science to production systems/ },
  { name: 'services', path: '/services', heading: /From mobile apps to production systems/ },
  { name: 'contact', path: '/contact', heading: /Let’s build something reliable/ },
  { name: 'sign-in', path: '/sign-in', heading: /Sign in to your account/ },
  { name: 'sign-up', path: '/sign-up', heading: /Create your account/ },
  { name: 'unauthorized', path: '/unauthorized', heading: /Sign in to continue/ },
  { name: 'dashboard', path: '/dashboard', heading: /Portfolio dashboard/, authenticated: true },
]

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  for (const screen of pages) {
    test(`${screen.name} displays its content and images on ${viewport.name}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.addInitScript(({ authenticated, user }) => {
        localStorage.setItem('portfolio-language', 'en')
        if (authenticated) {
          sessionStorage.setItem('portfolio-access-token', 'interface-test-token')
          sessionStorage.setItem('portfolio-user', JSON.stringify(user))
        }
      }, { authenticated: Boolean(screen.authenticated), user: admin })
      await page.route('**/api/**', async (route) => {
        const path = new URL(route.request().url()).pathname
        const responses = {
          '/api/auth/me': admin,
          '/api/projects': [project],
          '/api/qualifications': [qualification],
          '/api/contacts': [],
          '/api/users': [admin],
        }
        if (!(path in responses)) {
          throw new Error(`Unexpected API request in interface test: ${path}`)
        }
        await route.fulfill({ json: responses[path] })
      })

      await page.goto(screen.path)
      await expect(page.getByRole('heading', { level: 1, name: screen.heading })).toBeVisible()
      if (screen.name === 'projects') await expect(page.getByRole('heading', { name: 'Portfolio project' })).toBeVisible()
      if (screen.name === 'education') await expect(page.getByRole('heading', { name: 'Computer science', exact: true })).toBeVisible()
      if (screen.name === 'dashboard') await expect(page.getByRole('heading', { name: 'Contact submissions' })).toBeVisible()
      if (screen.name === 'contact') await expect(page.getByRole('button', { name: 'Send message' })).toBeVisible()

      const images = page.locator('img')
      const imageCount = await images.count()
      expect(imageCount).toBeGreaterThan(0)
      for (let index = 0; index < imageCount; index += 1) {
        await images.nth(index).scrollIntoViewIfNeeded()
      }
      for (let index = 0; index < imageCount; index += 1) {
        const image = images.nth(index)
        const src = await image.getAttribute('src')
        await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0), {
          message: `Image failed to load: ${src}`,
          timeout: 15_000,
        }).toBe(true)
      }
      await page.evaluate(() => window.scrollTo(0, 0))
      const screenshot = await page.screenshot({ path: testInfo.outputPath(`${screen.name}-${viewport.name}.png`), fullPage: true })
      await testInfo.attach(`${screen.name}-${viewport.name}`, { body: screenshot, contentType: 'image/png' })
    })
  }
}
