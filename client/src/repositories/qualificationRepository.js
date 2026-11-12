import { apiRequest } from './apiClient.js'
import { localizedPeriod } from '@/lib/period.js'

export function listQualifications() {
  return apiRequest('/api/qualifications')
}

export async function listPortfolioQualifications() {
  const records = await listQualifications()
  return records.map((qualification) => ({
    id: qualification.slug || qualification._id,
    title: { en: qualification.title, fr: qualification.titleFr || qualification.title },
    period: localizedPeriod(qualification),
    institution: qualification.institution || '',
    location: { en: qualification.location || '', fr: qualification.locationFr || qualification.location || '' },
    detail: { en: qualification.description, fr: qualification.descriptionFr || qualification.description },
  }))
}

export function createQualification(values, token) {
  return apiRequest('/api/qualifications', { method: 'POST', body: values, token })
}

export function updateQualification(id, values, token) {
  return apiRequest(`/api/qualifications/${encodeURIComponent(id)}`, { method: 'PUT', body: values, token })
}

export function deleteQualification(id, token) {
  return apiRequest(`/api/qualifications/${encodeURIComponent(id)}`, { method: 'DELETE', token })
}
