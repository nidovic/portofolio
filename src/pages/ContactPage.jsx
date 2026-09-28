import { ArrowUpRight, AtSign, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ContactForm from '@/components/ContactForm.jsx'
import PageIntro from '@/components/PageIntro.jsx'

function ContactPage() {
  const { t } = useTranslation()

  return (
    <div className="page-wrap inner-page contact-page">
      <PageIntro eyebrow={t('contact.eyebrow')} title={t('contact.title')} description={t('contact.intro')} />
      <div className="contact-layout">
        <aside className="contact-aside">
          <div className="contact-detail">
            <span><AtSign size={18} aria-hidden="true" /></span>
            <div><p>{t('contact.emailLabel')}</p><a href="mailto:maya.laurent@example.com">maya.laurent@example.com</a></div>
          </div>
          <div className="contact-detail">
            <span><MapPin size={18} aria-hidden="true" /></span>
            <div><p>{t('contact.locationLabel')}</p><span>{t('contact.location')}</span></div>
          </div>
          <a className="contact-social" href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
            LinkedIn <ArrowUpRight size={15} aria-hidden="true" />
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