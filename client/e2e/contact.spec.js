import { randomUUID } from 'node:crypto'
import process from 'node:process'
import { test, expect } from '@playwright/test'
import mongoose from 'mongoose'

test('a visitor submits a contact and it is saved in MongoDB', async ({ page }, testInfo) => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required for the isolated PortfolioE2E database.')
  }

  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'PortfolioE2E' })
  let contactId
  try {
    const email = `e2e-${randomUUID()}@example.test`
    await page.addInitScript(() => localStorage.setItem('portfolio-language', 'en'))
    await page.goto('/contact')
    await page.getByLabel(/^First name/).fill('Alex')
    await page.getByLabel(/^Last name/).fill('Example')
    await page.getByLabel(/^Contact number/).fill('+1 416 555 0123')
    await page.getByLabel(/^Email/).fill(email)
    await page.getByLabel(/on your mind/).fill('A test message from Playwright.')
    await page.screenshot({ path: testInfo.outputPath('contact-form.png'), fullPage: true })

    const [response] = await Promise.all([
      page.waitForResponse((result) => result.url().endsWith('/api/contacts') && result.request().method() === 'POST'),
      page.getByRole('button', { name: /send message/i }).click(),
    ])
    expect(response.status()).toBe(201)
    const body = await response.json()
    contactId = body._id
    expect(contactId).toBeTruthy()
    await expect(page.getByRole('status')).toContainText('Your contact details were saved')
    const saved = await mongoose.connection.collection('contacts').findOne({ _id: new mongoose.Types.ObjectId(contactId) })
    expect(saved).toMatchObject({ email, firstName: 'Alex', message: 'A test message from Playwright.' })
    await page.screenshot({ path: testInfo.outputPath('contact-success.png'), fullPage: true })
  } finally {
    if (contactId) {
      await mongoose.connection.collection('contacts').deleteOne({ _id: new mongoose.Types.ObjectId(contactId) })
    }
    await mongoose.disconnect()
  }
})
