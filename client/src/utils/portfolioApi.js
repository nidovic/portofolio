import { EDUCATION, PROJECTS } from '@/constants/profile.js'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '')

async function requestApi(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 204) return null
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(result.error || `API request failed with status ${response.status}.`)
  }
  return result
}

function normalizeProject(project, index) {
  return {
    id: project.slug || project._id,
    name: project.title,
    period: project.completionDate || '',
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
  }
}

function normalizeQualification(qualification) {
  return {
    id: qualification.slug || qualification._id,
    title: { en: qualification.title, fr: qualification.titleFr || qualification.title },
    period: { en: qualification.completionDate, fr: qualification.completionDate },
    institution: qualification.institution || '',
    location: { en: qualification.location || '', fr: qualification.locationFr || qualification.location || '' },
    detail: { en: qualification.description, fr: qualification.descriptionFr || qualification.description },
  }
}

export async function createContact(values) {
  return requestApi('/api/contacts', { method: 'POST', body: values })
}

export async function loadProjects() {
  const records = await requestApi('/api/projects')
  return records.map(normalizeProject)
}

export async function loadQualifications() {
  const records = await requestApi('/api/qualifications')
  return records.map(normalizeQualification)
}

export const fallbackProjects = PROJECTS
export const fallbackQualifications = EDUCATION