import { ArrowUpRight, AtSign, MapPin, Phone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ContactForm from '@/components/ContactForm.jsx'
import PageIntro from '@/components/PageIntro.jsx'
import { PROFILE } from '@/constants/profile.js'
import { localizedText } from '@/lib/localized.js'

function ContactPage() {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage

  return (
    <div className="page-wrap inner-page contact-page">
      <PageIntro eyebrow={t('contact.eyebrow')} title={t('contact.title')} description={t('contact.intro')} />
      <div className="contact-layout">
        <aside className="contact-aside">
          <div className="contact-detail">
            <span><AtSign size={18} aria-hidden="true" /></span>
            <div><p>{t('contact.emailLabel')}</p><a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a></div>
          </div>
          <div className="contact-detail">
            <span><MapPin size={18} aria-hidden="true" /></span>
            <div><p>{t('contact.locationLabel')}</p><span>{localizedText(PROFILE.location, language)}</span></div>
          </div>
          <div className="contact-detail">
            <span><Phone size={18} aria-hidden="true" /></span>
            <div><p>{t('contact.phoneLabel')}</p><a href={PROFILE.phoneHref}>{PROFILE.phone}</a></div>
          </div>
          <a className="contact-social" href={PROFILE.githubUrl} target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </aside>
        <section className="contact-form-panel" aria-labelledby="contact-form-title">
          <h2 id="contact-form-title">{t('contact.formTitle')}</h2>
          <ContactForm />
        </section>
      </div>
    </div>
  )
}

export default ContactPage