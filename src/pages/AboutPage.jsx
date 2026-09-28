import { ArrowDownToLine, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageIntro from '@/components/PageIntro.jsx'
import { ROUTES } from '@/constants/routes.js'

const toolkit = ['React', 'JavaScript', 'CSS', 'Tailwind', 'Figma', 'WCAG']

function AboutPage() {
  const { t } = useTranslation()
  const facts = t('about.facts', { returnObjects: true })

  return (
    <div className="page-wrap inner-page">
      <PageIntro eyebrow={t('about.eyebrow')} title={t('about.title')} />
      <section className="about-layout">
        <div className="about-photo-wrap">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85" alt={t('about.portraitAlt')} />
          <span className="photo-caption">Maya · Lyon · 2026</span>
        </div>
        <div className="about-copy">
          <p className="about-lead">{t('about.intro')}</p>
          <p>{t('about.body')}</p>
          <a className="resume-link" href="/maya-laurent-resume.pdf" download>
            <span className="resume-icon"><ArrowDownToLine size={18} /></span>
            <span>{t('about.resume')}<small>PDF · 1 page</small></span>
            <ArrowUpRight className="resume-arrow" size={18} />
          </a>
        </div>
      </section>
      <section className="about-extras">
        <div className="facts-block">
          <p className="eyebrow"><span className="eyebrow-dot" />{t('about.label')}</p>
          <ul>{facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
        </div>
        <div className="toolkit-block">
          <p className="eyebrow"><span className="eyebrow-dot" />{t('about.toolkit')}</p>
          <p>{t('about.toolkitNote')}</p>
          <div className="toolkit-list">{toolkit.map((item) => <span key={item}>{item}</span>)}</div>
        </div>
      </section>
      <Link className="page-next-link" to={ROUTES.projects}>{t('nav.projects')} <ArrowUpRight size={17} /></Link>
    </div>
  )
}

export default AboutPage