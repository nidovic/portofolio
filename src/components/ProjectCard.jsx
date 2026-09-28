import { ArrowUpRight, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { localizedText } from '@/lib/localized.js'

function ProjectCard({ project, compact = false }) {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage

  return (
    <article className={`project-card${compact ? ' project-card--compact' : ''}`}>
      <div className={`project-card__image-wrap${project.imageKind === 'logo' ? ' project-card__image-wrap--logo' : ''}`}>
        <img className="project-card__image" src={project.image} alt={localizedText(project.imageAlt, language)} loading="lazy" />
        <span className="project-card__number">{project.number}</span>
      </div>
      <div className="project-card__content">
        <p className="project-card__category">{localizedText(project.category, language)}{project.period && ` · ${project.period}`}</p>
        <h2>{project.name}</h2>
        <p className="project-card__description">{localizedText(project.description, language)}</p>
        {!compact && (
          <div className="project-card__details">
            <p><span>{t('projects.role')}</span>{localizedText(project.role, language)}</p>
            <p><span>{t('projects.outcome')}</span>{localizedText(project.outcome, language)}</p>
            <p><span>{t('projects.stack')}</span>{project.stack.join(' · ')}</p>
          </div>
        )}
        {!compact && project.links.length > 0 && (
          <div className="project-card__links">
            {project.links.map((link) => (
              <a key={link.type} href={link.url} target="_blank" rel="noreferrer">
                {t(`projects.linkLabels.${link.type}`)} <ExternalLink size={13} aria-hidden="true" />
              </a>
            ))}
          </div>
        )}
        {compact && <ArrowUpRight className="project-card__arrow" size={20} aria-hidden="true" />}
      </div>
    </article>
  )
}

export default ProjectCard