import { ArrowDownToLine, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageIntro from '@/components/PageIntro.jsx'
import { ROUTES } from '@/constants/routes.js'
import { EXPERIENCE, PROFILE, SKILLS } from '@/constants/profile.js'
import { localizedText } from '@/lib/localized.js'

function AboutPage() {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage

  return (
    <div className="page-wrap inner-page">
      <PageIntro eyebrow={localizedText(PROFILE.title, language)} title={PROFILE.fullName} description={localizedText(PROFILE.summary, language)} />
      <section className="about-layout">
        <div className="about-photo-wrap">
          <img src={PROFILE.avatarUrl} alt={`${PROFILE.fullName} — ${localizedText(PROFILE.title, language)}`} />
          <span className="photo-caption">{localizedText(PROFILE.location, language)}</span>
        </div>
        <div className="about-copy">
          <p className="about-lead">{localizedText(PROFILE.about, language)}</p>
          <p>{localizedText(EXPERIENCE[0].summary, language)}</p>
          <a className="resume-link" href={PROFILE.resumePath} download>
            <span className="resume-icon"><ArrowDownToLine size={18} /></span>
            <span>{t('about.resume')}<small>PDF · 1 page</small></span>
            <ArrowUpRight className="resume-arrow" size={18} />
          </a>
        </div>
      </section>
      <section className="about-extras">
        <div className="facts-block">
          <p className="eyebrow"><span className="eyebrow-dot" />{t('about.label')}</p>
          <ul>
            <li>{localizedText(PROFILE.location, language)}</li>
            <li>{PROFILE.phone}</li>
            <li>{PROFILE.email}</li>
            <li>{PROFILE.languages[language === 'fr' ? 'fr' : 'en'].join(' · ')}</li>
          </ul>
        </div>
        <div className="toolkit-block">
          <p className="eyebrow"><span className="eyebrow-dot" />{t('about.toolkit')}</p>
          <p>{t('about.toolkitNote')}</p>
          <div className="skill-groups">
            {SKILLS.map((group) => (
              <div className="skill-group" key={group.id}>
                <strong>{localizedText(group.label, language)}</strong>
                <div className="toolkit-list">{group.items.map((item) => <span key={item}>{item}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Link className="page-next-link" to={ROUTES.projects}>{t('nav.projects')} <ArrowUpRight size={17} /></Link>
    </div>
  )
}

export default AboutPage