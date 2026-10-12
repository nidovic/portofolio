import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageIntro from '@/components/PageIntro.jsx'
import ProjectCard from '@/components/ProjectCard.jsx'
import { ROUTES } from '@/constants/routes.js'
import { fallbackProjects, loadProjects } from '@/utils/portfolioApi.js'

function ProjectsPage() {
  const { t } = useTranslation()
  const [projects, setProjects] = useState(fallbackProjects)

  useEffect(() => {
    let isMounted = true

    loadProjects()
      .then((records) => {
        if (isMounted && records.length > 0) setProjects(records)
      })
      .catch(() => {
        // Keep the Assignment 1 profile content visible while the API is unavailable.
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="page-wrap inner-page">
      <PageIntro eyebrow={t('projects.eyebrow')} title={t('projects.title')} description={t('projects.intro')} />
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