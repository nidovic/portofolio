import { ArrowUpRight, BriefcaseBusiness, GraduationCap, Medal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageIntro from '@/components/PageIntro.jsx'
import { ROUTES } from '@/constants/routes.js'
import { EDUCATION, EXPERIENCE } from '@/constants/profile.js'
import { localizedText } from '@/lib/localized.js'

const entryIcons = { degree: GraduationCap, certificate: Medal, work: BriefcaseBusiness }

function TimelineEntry({ entry, type, language }) {
  const Icon = entryIcons[type]
  const title = localizedText(entry.title, language)
  const place = entry.institution
    ? `${entry.institution} · ${localizedText(entry.location, language)}`
    : `${entry.employer} · ${localizedText(entry.location, language)}`
  const detail = entry.detail ?? entry.summary

  return (
    <article className="timeline-entry">
      <span className="timeline-entry__date">{localizedText(entry.period, language)}</span>
      <span className="timeline-entry__icon"><Icon size={18} aria-hidden="true" /></span>
      <div>
        <h3>{title}</h3>
        <p className="timeline-entry__place">{place}</p>
        <p className="timeline-entry__detail">{localizedText(detail, language)}</p>
      </div>
    </article>
  )
}

function EducationPage() {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage

  return (
    <div className="page-wrap inner-page">
      <PageIntro eyebrow={t('education.eyebrow')} title={t('education.title')} description={t('education.intro')} />
      <section className="timeline-section">
        <h2>{t('education.educationLabel')}</h2>
        <div className="timeline-list">
          {EDUCATION.map((entry) => <TimelineEntry key={entry.institution} entry={entry} type="degree" language={language} />)}
        </div>
      </section>
      <section className="timeline-section timeline-section--work">
        <h2>{t('education.experienceLabel')}</h2>
        <div className="timeline-list">
          {EXPERIENCE.map((entry) => <TimelineEntry key={entry.employer} entry={entry} type="work" language={language} />)}
        </div>
      </section>
      <p className="learning-note">{t('education.note')}</p>
      <Link className="page-next-link" to={ROUTES.services}>{t('nav.services')} <ArrowUpRight size={17} /></Link>
    </div>
  )
}

export default EducationPage