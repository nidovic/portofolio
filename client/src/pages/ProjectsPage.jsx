import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageIntro from '@/components/PageIntro.jsx'
import ProjectCard from '@/components/ProjectCard.jsx'
import { ROUTES } from '@/constants/routes.js'
import { PROJECTS } from '@/constants/profile.js'
import { listPortfolioProjects } from '@/repositories/projectRepository.js'

function ProjectsPage() {
  const { t } = useTranslation()
  const [projects, setProjects] = useState(PROJECTS)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [apiLoaded, setApiLoaded] = useState(false)

  useEffect(() => {
    let isMounted = true

    listPortfolioProjects()
      .then((records) => {
        if (isMounted) {
          setProjects(records)
          setApiLoaded(true)
        }
      })
      .catch((error) => {
        if (isMounted) setLoadError(error.message)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="page-wrap inner-page">
      <PageIntro eyebrow={t('projects.eyebrow')} title={t('projects.title')} description={t('projects.intro')} />
      {loading && <p role="status">{t('projects.loading')}</p>}
      {loadError && <p className="api-notice" role="status">{t('projects.loadFallback', { error: loadError })}</p>}
      {apiLoaded && projects.length === 0 && <p className="api-notice">{t('projects.empty')}</p>}
      <div className="project-grid project-grid--full">
        {projects.map((project, index) => (
          <ProjectCard key={project.id || project.slug || project._id} project={{ ...project, number: String(index + 1).padStart(2, '0') }} />
        ))}
      </div>
      <section className="project-inquiry">
        <p>{t('projects.inquiry')}</p>
        <Link to={ROUTES.contact}>{t('projects.inquiryLink')} <ArrowUpRight size={17} /></Link>
      </section>
    </div>
  )
}

export default ProjectsPage