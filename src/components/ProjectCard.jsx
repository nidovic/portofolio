import { ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function ProjectCard({ project, compact = false }) {
  const { t } = useTranslation()

  return (
    <article className={`project-card${compact ? ' project-card--compact' : ''}`}>
      <div className="project-card__image-wrap">
        <img className="project-card__image" src={project.image} alt={project.alt} loading="lazy" />
        <span className="project-card__number">{project.number}</span>
      </div>
      <div className="project-card__content">
        <p className="project-card__category">{project.category}</p>
        <h2>{project.name}</h2>
        <p className="project-card__description">{project.description}</p>
        {!compact && (
          <div className="project-card__details">
            <p><span>{t('projects.role')}</span>{project.role}</p>
            <p><span>{t('projects.outcome')}</span>{project.outcome}</p>
          </div>
        )}
        {compact && <ArrowUpRight className="project-card__arrow" size={20} aria-hidden="true" />}
      </div>
    </article>
  )
}

export default ProjectCard