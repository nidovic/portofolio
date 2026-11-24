import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import i18n from '@/i18n.js'
import ContactForm from './ContactForm.jsx'
import { createContact } from '@/repositories/contactRepository.js'

vi.mock('@/repositories/contactRepository.js', () => ({
  createContact: vi.fn(),
}))

beforeEach(async () => {
  await i18n.changeLanguage('en')
  vi.resetAllMocks()
})

afterEach(cleanup)

function renderForm() {
  return render(
    <MemoryRouter initialEntries={['/contact']}>
      <Routes>
        <Route path="/contact" element={<ContactForm />} />
        <Route path="/" element={<p>Contact saved</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function fillForm(user) {
  await user.type(screen.getByLabelText(/^First name/), 'Alex')
  await user.type(screen.getByLabelText(/^Last name/), 'Example')
  await user.type(screen.getByLabelText(/^Contact number/), '+1 416 555 0123')
  await user.type(screen.getByLabelText(/^Email/), 'alex@example.test')
  await user.type(screen.getByLabelText(/on your mind/), 'Hello from the test.')
}

describe('ContactForm', () => {
  it('rejects invalid input without calling the API', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.type(screen.getByLabelText(/^Email/), 'not-an-email')
    await user.click(screen.getByRole('button', { name: /send message/i }))
    expect(await screen.findByText('Enter a valid email address.')).toBeTruthy()
    expect(screen.getAllByText('This field is required.')).toHaveLength(4)
    expect(createContact).not.toHaveBeenCalled()
  })

  it('submits the entered values and navigates after success', async () => {
    const user = userEvent.setup()
    createContact.mockResolvedValue({ _id: 'contact-id' })
    renderForm()
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: /send message/i }))
    await waitFor(() => expect(createContact).toHaveBeenCalledWith({
      firstName: 'Alex',
      lastName: 'Example',
      phone: '+1 416 555 0123',
      email: 'alex@example.test',
      message: 'Hello from the test.',
    }))
    expect(await screen.findByText('Contact saved')).toBeTruthy()
  })

  it('shows a server error and stays on the form', async () => {
    const user = userEvent.setup()
    createContact.mockRejectedValue(new Error('The API could not be reached.'))
    renderForm()
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: /send message/i }))
    expect((await screen.findByRole('alert')).textContent).toBe('The API could not be reached.')
    expect(screen.getByLabelText(/^First name/).value).toBe('Alex')
  })
})
