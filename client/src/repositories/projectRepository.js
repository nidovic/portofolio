import { apiRequest } from './apiClient.js'
import { localizedPeriod } from '@/lib/period.js'

export function listProjects() {
  return apiRequest('/api/projects')
}

export async function listPortfolioProjects() {
  const records = await listProjects()
  return records.map((project, index) => ({
    id: project.slug || project._id,
    name: project.title,
    period: localizedPeriod(project),
    category: { en: project.category || 'Project', fr: project.categoryFr || 'Projet' },
    description: { en: project.description, fr: project.descriptionFr || project.description },
    role: { en: project.role || '', fr: project.roleFr || project.role || '' },
    outcome: { en: project.outcome || '', fr: project.outcomeFr || project.outcome || '' },
    stack: project.stack || [],
    image: project.image || '',
    imageKind: project.imageKind || 'photo',
    imageAlt: { en: project.imageAlt || project.title, fr: project.imageAltFr || project.title },
    links: project.links || (project.sourceUrl ? [{ type: 'liveProduct', url: project.sourceUrl }] : []),
    number: String(index + 1).padStart(2, '0'),
  }))
}

export function createProject(values, token) {
  return apiRequest('/api/projects', { method: 'POST', body: values, token })
}

export function updateProject(id, values, token) {
  return apiRequest(`/api/projects/${encodeURIComponent(id)}`, { method: 'PUT', body: values, token })
}

export function deleteProject(id, token) {
  return apiRequest(`/api/projects/${encodeURIComponent(id)}`, { method: 'DELETE', token })
}
