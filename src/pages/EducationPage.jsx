import { ArrowUpRight, BriefcaseBusiness, GraduationCap, Medal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageIntro from '@/components/PageIntro.jsx'
import { ROUTES } from '@/constants/routes.js'

const entryIcons = { degree: GraduationCap, certificate: Medal, work: BriefcaseBusiness }

function TimelineEntry({ entry }) {
  const Icon = entryIcons[entry.type]

  return (
    <article className="timeline-entry">
      <span className="timeline-entry__date">{entry.period}</span>
      <span className="timeline-entry__icon"><Icon size={18} aria-hidden="true" /></span>
      <div>
        <h3>{entry.title}</h3>
        <p className="timeline-entry__place">{entry.place}</p>
        <p className="timeline-entry__detail">{entry.detail}</p>
      </div>
    </article>
  )
}

function EducationPage() {
  const { t } = useTranslation()
  const entries = t('education.entries', { returnObjects: true })

  return (
    <div className="page-wrap inner-page">
      <PageIntro eyebrow={t('education.eyebrow')} title={t('education.title')} description={t('education.intro')} />
      <section className="timeline-section">
        <h2>{t('education.educationLabel')}</h2>
        <div className="timeline-list">
          {entries.filter((entry) => entry.type !== 'work').map((entry) => <TimelineEntry key={entry.title} entry={entry} />)}
        </div>
      </section>
      <section className="timeline-section timeline-section--work">
        <h2>{t('education.experienceLabel')}</h2>
        <div className="timeline-list">
          {entries.filter((entry) => entry.type === 'work').map((entry) => <TimelineEntry key={entry.title} entry={entry} />)}
        </div>
      </section>
      <p className="learning-note">{t('education.note')}</p>
      <Link className="page-next-link" to={ROUTES.services}>{t('nav.services')} <ArrowUpRight size={17} /></Link>
    </div>
  )
}

export default EducationPage