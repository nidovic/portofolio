import { ArrowUpRight, CloudCog, Code2, Network, Smartphone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageIntro from '@/components/PageIntro.jsx'
import { ROUTES } from '@/constants/routes.js'
import { SERVICES } from '@/constants/profile.js'
import { localizedText } from '@/lib/localized.js'

const serviceIcons = {
  mobile: Smartphone,
  web: Code2,
  api: Network,
  cloud: CloudCog,
}

function ServicesPage() {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage
  const steps = t('services.steps', { returnObjects: true })

  return (
    <div className="page-wrap inner-page">
      <PageIntro eyebrow={t('services.eyebrow')} title={t('services.title')} description={t('services.intro')} />
      <section className="services-grid" aria-label={t('nav.services')}>
        {SERVICES.map((service, index) => {
          const Icon = serviceIcons[service.icon]
          return (
            <article className="service-item" key={service.icon}>
              <div className="service-item__top"><span>0{index + 1}</span><Icon size={23} aria-hidden="true" /></div>
              <h2>{localizedText(service.title, language)}</h2>
              <p>{localizedText(service.description, language)}</p>
              <span className="service-item__tag">{service.tag}</span>
            </article>
          )
        })}
      </section>
      <section className="process-section">
        <p className="eyebrow"><span className="eyebrow-dot" />{t('services.processEyebrow')}</p>
        <h2>{t('services.process')}</h2>
        <div className="process-steps">
          {steps.map((step) => (
            <article className="process-step" key={step.number}>
              <span>{step.number}</span><h3>{step.title}</h3><p>{step.detail}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="service-cta">
        <p>{t('services.cta')}</p>
        <Link to={ROUTES.contact}>{t('services.ctaLink')} <ArrowUpRight size={18} /></Link>
      </section>
    </div>
  )
}

export default ServicesPage