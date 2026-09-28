import { ArrowDownRight, ArrowUpRight, Sparkles } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button.jsx'
import ProjectCard from '@/components/ProjectCard.jsx'
import { ROUTES } from '@/constants/routes.js'
import { PROFILE, PROJECTS } from '@/constants/profile.js'
import { localizedText } from '@/lib/localized.js'

function HomePage() {
  const { t, i18n } = useTranslation()
  const { state } = useLocation()
  const language = i18n.resolvedLanguage
  const projects = PROJECTS.slice(0, 2)

  return (
    <>
      <section className="home-hero page-wrap">
        {state?.contactSubmitted && (
          <p className="form-success" role="status">{t('home.contactSubmitted')}</p>
        )}
        <div className="home-hero__copy">
          <p className="eyebrow"><span className="eyebrow-dot" />{localizedText(PROFILE.title, language)} · {localizedText(PROFILE.location, language)}</p>
          <h1>{PROFILE.shortName}<br /><span>{t('home.titleAccent')}</span></h1>
          <p className="home-hero__intro">{localizedText(PROFILE.summary, language)}</p>
          <div className="home-hero__actions">
            <Button asChild className="action-button action-button--dark" size="lg">
              <Link to={ROUTES.projects}>{t('home.primaryCta')} <ArrowUpRight size={17} /></Link>
            </Button>
            <Button asChild variant="outline" className="action-button action-button--light" size="lg">
              <Link to={ROUTES.about}>{t('home.secondaryCta')} <ArrowDownRight size={17} /></Link>
            </Button>
          </div>
          <div className="availability"><span />{t('home.language')}</div>
        </div>
        <div className="home-hero__visual">
          <div className="portrait-frame">
            <img src={PROFILE.avatarUrl} alt={`${PROFILE.fullName} — ${localizedText(PROFILE.title, language)}`} fetchPriority="high" />
          </div>
          <div className="portrait-sticker"><Sparkles size={16} /><span>{t('home.note')}</span></div>
          <span className="hero-index">{PROFILE.initials} / {localizedText(PROFILE.location, language)}</span>
        </div>
        <div className="hero-bottomline">
          <span>01 — {String(PROJECTS.length).padStart(2, '0')}</span>
          <span>{t('home.language')}</span>
          <Link to={ROUTES.projects} aria-label={t('home.selectedLink')}><ArrowDownRight size={19} /></Link>
        </div>
      </section>

      <section className="home-stats page-wrap" aria-label={t('home.overview')}>
        <div><strong>{PROFILE.yearsExperience}</strong><span>{t('home.years')}</span></div>
        <div><strong>{PROFILE.applicationCount}</strong><span>{t('home.applications')}</span></div>
        <p>Flutter <i /> React <i /> Go <i /> Node.js</p>
      </section>

      <section className="featured-section page-wrap">
        <div className="section-heading">
          <div><p className="eyebrow"><span className="eyebrow-dot" />{t('home.selectedEyebrow')}</p><h2>{t('home.selected')}</h2></div>
          <Link className="text-link" to={ROUTES.projects}>{t('home.selectedLink')} <ArrowUpRight size={16} /></Link>
        </div>
        <div className="project-grid project-grid--featured">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={{ ...project, number: String(index + 1).padStart(2, '0') }} compact />
          ))}
        </div>
      </section>
    </>
  )
}

export default HomePage