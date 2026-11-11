import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageIntro from '@/components/PageIntro.jsx'
import { ROUTES } from '@/constants/routes.js'
import { useAuth } from '@/contexts/useAuth.js'

function AuthPage({ mode }) {
  const isSignUp = mode === 'signup'
  const { t } = useTranslation()
  const { isAuthenticated, signIn, signUp, acknowledgeSignOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from
  const destination = from?.pathname ? `${from.pathname}${from.search || ''}${from.hash || ''}` : ROUTES.admin
  const [submitError, setSubmitError] = useState('')
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onBlur' })

  useEffect(() => {
    acknowledgeSignOut()
  }, [acknowledgeSignOut])

  if (isAuthenticated) return <Navigate to={destination} replace />

  async function submit(values) {
    setSubmitError('')
    clearErrors(['name', 'email', 'password'])
    try {
      if (isSignUp) await signUp(values)
      else await signIn(values)
      navigate(destination, { replace: true })
    } catch (error) {
      if (error.status === 400 && error.details?.length) {
        for (const detail of error.details) {
          if (['name', 'email', 'password'].includes(detail.field)) {
            setError(detail.field, {
              type: 'server',
              message: t(`auth.validation.${detail.field}`),
            })
          }
        }
      }
      setSubmitError(getAuthErrorMessage(error, t, isSignUp))
    }
  }

  function getAuthErrorMessage(error, translate, creatingAccount) {
    if (error.code === 'network') return translate('auth.errors.network')
    if (error.status === 401) return translate('auth.errors.credentials')
    if (error.status === 409) return translate('auth.errors.conflict')
    if (error.status === 429) return translate('auth.errors.rateLimit')
    if (error.status === 400) return translate('auth.errors.validation')
    if (error.status >= 500) return translate('auth.errors.server')
    return creatingAccount ? translate('auth.errors.signup') : translate('auth.errors.signin')
  }

  return (
    <div className="page-wrap inner-page auth-page">
      <PageIntro
        eyebrow={t(isSignUp ? 'auth.signupEyebrow' : 'auth.signinEyebrow')}
        title={t(isSignUp ? 'auth.signupTitle' : 'auth.signinTitle')}
        description={t(isSignUp ? 'auth.signupIntro' : 'auth.signinIntro')}
      />
      <section className="auth-panel" aria-label={t(isSignUp ? 'auth.signupTitle' : 'auth.signinTitle')}>
        <form className="contact-form" onSubmit={handleSubmit(submit)} noValidate aria-busy={isSubmitting}>
          {isSignUp && (
            <div className="form-field">
              <label htmlFor="name">{t('auth.name')}</label>
              <input id="name" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'auth-name-error' : undefined} {...register('name', { required: t('contact.required'), minLength: { value: 2, message: t('auth.nameInvalid') } })} />
              {errors.name && <span className="field-error" id="auth-name-error">{errors.name.message}</span>}
            </div>
          )}
          <div className="form-field">
            <label htmlFor="email">{t('contact.email')}</label>
            <input id="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'auth-email-error' : undefined} {...register('email', { required: t('contact.required'), pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t('contact.invalidEmail') } })} />
            {errors.email && <span className="field-error" id="auth-email-error">{errors.email.message}</span>}
          </div>
          <div className="form-field">
            <label htmlFor="password">{t('auth.password')}</label>
            <input id="password" type="password" autoComplete={isSignUp ? 'new-password' : 'current-password'} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'auth-password-error' : undefined} {...register('password', { required: t('contact.required'), minLength: isSignUp ? { value: 8, message: t('auth.passwordInvalid') } : undefined })} />
            {errors.password && <span className="field-error" id="auth-password-error">{errors.password.message}</span>}
          </div>
          {submitError && (
            <div className="auth-error" role="alert" aria-live="assertive">
              <strong>{t(isSignUp ? 'auth.signupErrorTitle' : 'auth.signinErrorTitle')}</strong>
              <p>{submitError}</p>
            </div>
          )}
          <button className="action-button action-button--dark auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('auth.submitting') : t(isSignUp ? 'auth.signupAction' : 'auth.signinAction')}
          </button>
        </form>
        <p className="auth-switch">
          {t(isSignUp ? 'auth.haveAccount' : 'auth.needAccount')}{' '}
          <Link to={isSignUp ? ROUTES.signIn : ROUTES.signUp} state={{ from: location.state?.from }}>{t(isSignUp ? 'auth.signinAction' : 'auth.signupAction')}</Link>
        </p>
      </section>
    </div>
  )
}

export default AuthPage
