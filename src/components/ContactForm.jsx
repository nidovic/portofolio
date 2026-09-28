import { useForm } from 'react-hook-form'
import { ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { ROUTES } from '@/constants/routes.js'

function ContactForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onBlur' })

  function handleValidSubmit() {
    // Assignment 1 is client-side only: validate, discard values, then return home.
    navigate(ROUTES.home, { state: { contactSubmitted: true } })
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit(handleValidSubmit)} noValidate>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="firstName">{t('contact.firstName')} <span aria-hidden="true">*</span></label>
          <input id="firstName" autoComplete="given-name" placeholder={t('contact.placeholders.firstName')} aria-invalid={Boolean(errors.firstName)} aria-describedby={errors.firstName ? 'firstName-error' : undefined} {...register('firstName', { required: t('contact.required') })} />
          {errors.firstName && <span className="field-error" id="firstName-error">{errors.firstName.message}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="lastName">{t('contact.lastName')} <span aria-hidden="true">*</span></label>
          <input id="lastName" autoComplete="family-name" placeholder={t('contact.placeholders.lastName')} aria-invalid={Boolean(errors.lastName)} aria-describedby={errors.lastName ? 'lastName-error' : undefined} {...register('lastName', { required: t('contact.required') })} />
          {errors.lastName && <span className="field-error" id="lastName-error">{errors.lastName.message}</span>}
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="phone">{t('contact.phone')} <span aria-hidden="true">*</span></label>
          <input id="phone" type="tel" autoComplete="tel" placeholder={t('contact.placeholders.phone')} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'phone-error' : undefined} {...register('phone', { required: t('contact.required'), pattern: { value: /^[+\d][\d\s().-]{6,20}$/, message: t('contact.invalidPhone') } })} />
          {errors.phone && <span className="field-error" id="phone-error">{errors.phone.message}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="email">{t('contact.email')} <span aria-hidden="true">*</span></label>
          <input id="email" type="email" autoComplete="email" placeholder={t('contact.placeholders.email')} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} {...register('email', { required: t('contact.required'), pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t('contact.invalidEmail') } })} />
          {errors.email && <span className="field-error" id="email-error">{errors.email.message}</span>}
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="message">{t('contact.message')} <span aria-hidden="true">*</span></label>
        <textarea id="message" rows="5" placeholder={t('contact.placeholders.message')} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'message-error' : undefined} {...register('message', { required: t('contact.required'), minLength: { value: 12, message: t('contact.required') } })} />
        {errors.message && <span className="field-error" id="message-error">{errors.message.message}</span>}
      </div>
      <div className="form-submit-row">
        <Button className="action-button action-button--dark" size="lg" type="submit" disabled={isSubmitting}>
          {t('contact.send')} <ArrowUpRight size={17} aria-hidden="true" />
        </Button>
        <p>{t('contact.note')}</p>
      </div>
    </form>
  )
}

export default ContactForm