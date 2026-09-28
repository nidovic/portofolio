import { ArrowDownRight, ArrowUpRight, Sparkles } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button.jsx'
import ProjectCard from '@/components/ProjectCard.jsx'
import { ROUTES } from '@/constants/routes.js'

function HomePage() {
  const { t } = useTranslation()
  const { state } = useLocation()
  const projects = t('projects.items', { returnObjects: true })

  return (
    <>
      <section className="home-hero page-wrap">
        {state?.contactSubmitted && (
          <p className="form-success" role="status">{t('home.contactSubmitted')}</p>
        )}
        <div className="home-hero__copy">
          <p className="eyebrow"><span className="eyebrow-dot" />{t('home.eyebrow')}</p>
          <h1>{t('home.titleLead')}<br /><span>{t('home.titleAccent')}</span></h1>
          <p className="home-hero__intro">{t('home.intro')}</p>
          <div className="home-hero__actions">
            <Button asChild className="action-button action-button--dark" size="lg">
              <Link to={ROUTES.projects}>{t('home.primaryCta')} <ArrowUpRight size={17} /></Link>
            </Button>
            <Button asChild variant="outline" className="action-button action-button--light" size="lg">
              <Link to={ROUTES.about}>{t('home.secondaryCta')} <ArrowDownRight size={17} /></Link>
            </Button>
          </div>
          <div className="availability"><span />{t('home.availability')}</div>
        </div>
        <div className="home-hero__visual">
          <div className="portrait-frame">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1100&q=90" alt={t('home.portraitAlt')} fetchPriority="high" />
          </div>
          <div className="portrait-sticker"><Sparkles size={16} /><span>{t('home.note')}</span></div>
          <span className="hero-index">ML / 26</span>
        </div>
        <div className="hero-bottomline">
          <span>01 — 06</span>
          <span>{t('home.availability')}</span>
          <Link to={ROUTES.projects} aria-label={t('home.selectedLink')}><ArrowDownRight size={19} /></Link>
        </div>
      </section>

      <section className="home-stats page-wrap" aria-label={t('home.overview')}>
        <div><strong>04</strong><span>{t('home.years')}</span></div>
        <div><strong>18+</strong><span>{t('home.projects')}</span></div>
        <p>React <i /> Accessibility <i /> Interface craft</p>
      </section>

      <section className="featured-section page-wrap">
        <div className="section-heading">
          <div><p className="eyebrow"><span className="eyebrow-dot" />{t('home.selectedEyebrow')}</p><h2>{t('home.selected')}</h2></div>
          <a className="text-link" href={ROUTES.projects}>{t('home.selectedLink')} <ArrowUpRight size={16} /></a>
        </div>
        <div className="project-grid project-grid--featured">
          {projects.slice(0, 2).map((project) => <ProjectCard key={project.name} project={project} compact />)}
        </div>
      </section>
    </>
  )
}

export default HomePage