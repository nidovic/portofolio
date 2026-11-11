import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import PageIntro from '@/components/PageIntro.jsx'
import { useAuth } from '@/contexts/useAuth.js'
import { formatPeriod } from '@/lib/period.js'
import {
  createContactRecord, deleteContact, listContacts, updateContact,
} from '@/repositories/contactRepository.js'
import {
  createProject, deleteProject, listProjects, updateProject,
} from '@/repositories/projectRepository.js'
import {
  createQualification, deleteQualification, listQualifications, updateQualification,
} from '@/repositories/qualificationRepository.js'
import { listUsers, updateUserRole } from '@/repositories/userRepository.js'

const resourceFields = {
  contacts: ['firstName', 'lastName', 'email', 'phone', 'message'],
  projects: ['slug', 'title', 'startDate', 'endDate', 'description', 'descriptionFr', 'category', 'categoryFr', 'role', 'roleFr', 'outcome', 'outcomeFr', 'stack', 'image', 'imageAlt', 'imageAltFr', 'imageKind', 'links'],
  qualifications: ['slug', 'title', 'titleFr', 'startDate', 'endDate', 'description', 'descriptionFr', 'institution', 'location', 'locationFr'],
}

const requiredFields = {
  contacts: ['firstName', 'lastName', 'email', 'phone', 'message'],
  projects: ['slug', 'title', 'startDate', 'description'],
  qualifications: ['slug', 'title', 'startDate', 'description'],
}

const projectLinkTypes = ['caseStudy', 'partnerPortal', 'courierPortal', 'liveProduct', 'github']

const api = {
  contacts: { list: listContacts, create: createContactRecord, update: updateContact, remove: deleteContact },
  projects: { list: listProjects, create: createProject, update: updateProject, remove: deleteProject },
  qualifications: { list: listQualifications, create: createQualification, update: updateQualification, remove: deleteQualification },
}

function emptyValues(resource) {
  return Object.fromEntries(resourceFields[resource].map((field) => [field, field === 'links' ? [] : '']))
}

function recordId(record) {
  return record._id || record.id
}

function RecordDetails({ resource, record }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage?.startsWith('fr') ? 'fr' : 'en'
  const period = resource === 'contacts' ? '' : formatPeriod(record, locale)
  const fields = resourceFields[resource].filter((field) => !['firstName', 'lastName', 'title', 'startDate', 'endDate', 'links'].includes(field))
  const links = Array.isArray(record.links) && record.links.length
    ? record.links
    : record.sourceUrl ? [{ type: 'liveProduct', url: record.sourceUrl }] : []

  return (
    <div className="admin-record__content">
      <strong>{record.title || `${record.firstName} ${record.lastName}`}</strong>
      <dl className="admin-record__details">
        {period && <div><dt>{t('admin.period')}</dt><dd>{period}</dd></div>}
        {fields.map((field) => {
          const value = Array.isArray(record[field]) ? record[field].join(', ') : record[field]
          return value ? <div key={field}><dt>{t(`admin.fields.${field}`)}</dt><dd>{value}</dd></div> : null
        })}
        {links.length > 0 && <div><dt>{t('admin.fields.links')}</dt><dd>
          <ul className="admin-record__links">
            {links.map((link, index) => {
              let isWebUrl = false
              try { isWebUrl = ['http:', 'https:'].includes(new URL(link.url).protocol) } catch { /* Display invalid legacy URLs as text. */ }
              return <li key={`${link.type}-${index}`}>
                {t(`projects.linkLabels.${link.type}`, { defaultValue: link.type })}: {' '}
                {isWebUrl ? <a href={link.url} target="_blank" rel="noreferrer">{link.url}</a> : link.url}
              </li>
            })}
          </ul>
        </dd></div>}
      </dl>
    </div>
  )
}

function ResourcePanel({ resource, token, canEdit, records, onChanged, setPageError }) {
  const { t } = useTranslation()
  const [editingId, setEditingId] = useState(null)
  const [values, setValues] = useState(() => emptyValues(resource))
  const [legacyPeriod, setLegacyPeriod] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState('')

  function startEdit(record) {
    setEditingId(recordId(record))
    setLegacyPeriod(!record.startDate ? record.completionDate || '' : '')
    setValues(Object.fromEntries(resourceFields[resource].map((field) => {
      const value = record[field]
      let fieldValue = value ?? ''
      if (field === 'stack' && Array.isArray(value)) fieldValue = value.join(', ')
      if (field === 'links') {
        const links = Array.isArray(value) && value.length
          ? value
          : record.sourceUrl ? [{ type: 'liveProduct', url: record.sourceUrl }] : []
        fieldValue = links.map((link) => ({ ...link, id: crypto.randomUUID() }))
      }
      return [field, fieldValue]
    })))
    setSuccess('')
  }

  function cancelEdit() {
    setEditingId(null)
    setLegacyPeriod('')
    setValues(emptyValues(resource))
  }

  async function submit(event) {
    event.preventDefault()
    setIsSaving(true)
    setPageError('')
    setSuccess('')
    const body = { ...values }
    try {
      if (resource === 'projects') {
        body.stack = String(body.stack || '').split(',').map((item) => item.trim()).filter(Boolean)
        if (body.imageKind === '') delete body.imageKind
        body.links = body.links
          .filter((link) => link.type && link.url.trim())
          .map(({ type, url }) => ({ type, url: url.trim() }))
      }
      if (resource !== 'contacts' && body.endDate && (!body.startDate || body.endDate < body.startDate)) {
        throw new Error(t('admin.invalidDateRange'))
      }
      if (editingId) await api[resource].update(editingId, body, token)
      else await api[resource].create(body, token)
      await onChanged()
      setSuccess(t('admin.saved'))
      cancelEdit()
    } catch (error) {
      setPageError(error.message || t('admin.loadError'))
    } finally {
      setIsSaving(false)
    }
  }

  function updateProjectLink(linkId, field, value) {
    setValues((current) => ({
      ...current,
      links: current.links.map((link) => link.id === linkId ? { ...link, [field]: value } : link),
    }))
  }

  function addProjectLink() {
    setValues((current) => ({
      ...current,
      links: [...current.links, { id: crypto.randomUUID(), type: '', url: '' }],
    }))
  }

  function removeProjectLink(linkId) {
    setValues((current) => ({
      ...current,
      links: current.links.filter((link) => link.id !== linkId),
    }))
  }

  async function remove(record) {
    if (!window.confirm(t('admin.confirmDelete'))) return
    setPageError('')
    setSuccess('')
    try {
      await api[resource].remove(recordId(record), token)
      await onChanged()
      setSuccess(t('admin.deleted'))
    } catch (error) {
      setPageError(error.message || t('admin.loadError'))
    }
  }

  return (
    <section className="admin-section">
      <div className="admin-section__heading">
        <h2>{t(`admin.resources.${resource}`)}</h2>
        <span>{records.length}</span>
      </div>
      {canEdit && (
        <form className="admin-form" onSubmit={submit}>
          <h3>{t(editingId ? 'admin.editRecord' : 'admin.newRecord')}</h3>
          <div className="admin-form__grid">
            {resourceFields[resource].filter((field) => field !== 'links').map((field) => (
              <label className={`form-field${field === 'description' || field === 'descriptionFr' || field === 'message' || field === 'outcome' || field === 'outcomeFr' ? ' admin-field--wide' : ''}`} key={field}>
                <span>{t(`admin.fields.${field}`)}{requiredFields[resource].includes(field) && !(field === 'startDate' && editingId) ? ' *' : ''}</span>
                {field === 'imageKind'
                  ? <select value={values[field]} onChange={(event) => setValues({ ...values, [field]: event.target.value })}>
                    <option value="">{t('admin.defaultImageKind')}</option>
                    <option value="photo">photo</option>
                    <option value="logo">logo</option>
                  </select>
                  : ['description', 'descriptionFr', 'message', 'outcome', 'outcomeFr'].includes(field)
                  ? <textarea rows={field === 'message' ? 4 : 3} required={requiredFields[resource].includes(field)} value={values[field]} onChange={(event) => setValues({ ...values, [field]: event.target.value })} />
                    : <input
                  type={field === 'email' ? 'email' : ['startDate', 'endDate'].includes(field) ? 'date' : 'text'}
                    required={requiredFields[resource].includes(field) && !(field === 'startDate' && editingId)}
                    min={field === 'endDate' ? values.startDate || undefined : undefined}
                    value={values[field]}
                    placeholder={field === 'stack' ? t('admin.stackHint') : ''}
                    onChange={(event) => setValues({ ...values, [field]: event.target.value })}
                    />}
                {field === 'startDate' && legacyPeriod && (
                  <small className="admin-field-hint">
                    {t('admin.dateRangeHint', { date: legacyPeriod })}
                  </small>
                )}
                {field === 'endDate' && <small className="admin-field-hint">{t('admin.endDateHint')}</small>}
              </label>
            ))}
            {resource === 'projects' && (
              <fieldset className="project-links-field admin-field--wide">
                <legend>{t('admin.fields.links')}</legend>
                <p className="project-links-hint">{t('admin.linksHint')}</p>
                {values.links.map((link) => (
                  <div className="project-link-row" key={link.id}>
                  <label className="form-field">
                    <span>{t('admin.linkType')}</span>
                    <select required value={link.type} onChange={(event) => updateProjectLink(link.id, 'type', event.target.value)}>
                      <option value="">{t('admin.selectLinkType')}</option>
                      {projectLinkTypes.filter((type) => type === link.type || !values.links.some((item) => item.id !== link.id && item.type === type)).map((type) => (
                        <option key={type} value={type}>{t(`projects.linkLabels.${type}`)}</option>
                      ))}
                    </select>
                  </label>
                  <label className="form-field">
                    <span>{t('admin.linkUrl')}</span>
                    <input type="url" required value={link.url} placeholder="https://example.com" onChange={(event) => updateProjectLink(link.id, 'url', event.target.value)} />
                  </label>
                  <button className="project-link-remove" type="button" onClick={() => removeProjectLink(link.id)}>{t('admin.removeLink')}</button>
                  </div>
                ))}
                <button className="project-link-add" type="button" onClick={addProjectLink}>{t('admin.addLink')}</button>
              </fieldset>
            )}
          </div>
          <div className="admin-form__actions">
            <button className="action-button action-button--dark" type="submit" disabled={isSaving}>{isSaving ? t('auth.submitting') : t(editingId ? 'admin.update' : 'admin.create')}</button>
            {editingId && <button className="action-button action-button--light" type="button" onClick={cancelEdit}>{t('admin.cancel')}</button>}
          </div>
        </form>
      )}
      {success && <p className="admin-feedback" role="status">{success}</p>}
      {records.length === 0
        ? <p className="admin-empty">{t('admin.empty')}</p>
        : <ul className="admin-record-list">
          {records.map((record) => (
            <li key={recordId(record)} className="admin-record">
              <RecordDetails resource={resource} record={record} />
              {canEdit && <div className="admin-record__actions">
                <button type="button" onClick={() => startEdit(record)}>{t('admin.edit')}</button>
                <button type="button" onClick={() => remove(record)}>{t('admin.delete')}</button>
              </div>}
            </li>
          ))}
        </ul>}
    </section>
  )
}

function UsersPanel({ token, currentUserId }) {
  const { t, i18n } = useTranslation()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let active = true
    listUsers(token)
      .then((result) => { if (active) setUsers(result) })
      .catch(() => { if (active) setError(t('admin.usersLoadError')) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [token, t])

  async function changeRole(user) {
    const promoting = user.role === 'user'
    if (!window.confirm(t(promoting ? 'admin.confirmPromote' : 'admin.confirmDemote', { name: user.name, email: user.email }))) return
    setError('')
    setSuccess('')
    setUpdatingId(recordId(user))
    try {
      const updated = await updateUserRole(recordId(user), promoting ? 'admin' : 'user', token)
      setUsers((current) => current.map((item) => recordId(item) === recordId(updated) ? updated : item))
      setSuccess(t(promoting ? 'admin.promoted' : 'admin.demoted', { name: updated.name }))
    } catch (requestError) {
      setError(requestError.status === 401 ? t('admin.sessionExpired') : requestError.status === 403 ? t('admin.accessChanged') : t('admin.promoteError'))
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <section className="admin-section">
      <div className="admin-section__heading"><h2>{t('admin.resources.users')}</h2>{!loading && !error && <span>{users.length}</span>}</div>
      {loading && <p role="status">{t('admin.loadingUsers')}</p>}
      {error && <p className="field-error" role="alert">{error}</p>}
      {success && <p className="admin-feedback" role="status">{success}</p>}
      {!loading && !error && users.length === 0 && <p className="admin-empty">{t('admin.empty')}</p>}
      {!loading && users.length > 0 && <ul className="admin-record-list">
        {users.map((user) => <li key={recordId(user)} className="admin-record">
          <div className="admin-record__content">
            <strong>{user.name}</strong>
            <dl className="admin-record__details">
              <div><dt>{t('admin.fields.email')}</dt><dd>{user.email}</dd></div>
              <div><dt>{t('admin.accountRole')}</dt><dd>{t(user.role === 'admin' ? 'admin.administrator' : 'admin.user')}</dd></div>
              {user.createdAt && <div><dt>{t('admin.createdAt')}</dt><dd>{new Date(user.createdAt).toLocaleDateString(i18n.resolvedLanguage)}</dd></div>}
            </dl>
          </div>
          {recordId(user) !== currentUserId && <div className="admin-record__actions">
            <button type="button" disabled={updatingId !== null} onClick={() => changeRole(user)}>
              {updatingId === recordId(user) ? t('admin.promoting') : t(user.role === 'user' ? 'admin.promote' : 'admin.demote')}
            </button>
          </div>}
        </li>)}
      </ul>}
    </section>
  )
}

function AdminPage() {
  const { t } = useTranslation()
  const { token, user, isAdmin, refreshUser } = useAuth()
  const [records, setRecords] = useState({ contacts: [], projects: [], qualifications: [] })
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [pageError, setPageError] = useState('')
  const [roleReady, setRoleReady] = useState(false)
  const [roleError, setRoleError] = useState('')

  useEffect(() => {
    let active = true
    async function checkRole() {
      try {
        await refreshUser()
        if (active) {
          setRoleError('')
          setRoleReady(true)
        }
      } catch (error) {
        if (active) {
          setRoleReady(false)
          setRoleError(error.status === 401 ? t('admin.sessionExpired') : t('admin.roleCheckError'))
        }
      }
    }
    checkRole()
    window.addEventListener('focus', checkRole)
    return () => {
      active = false
      window.removeEventListener('focus', checkRole)
    }
  }, [refreshUser, t])

  const loadRecords = useCallback(async () => {
    const [contacts, projects, qualifications] = await Promise.all([
      listContacts(token),
      listProjects(),
      listQualifications(),
    ])
    setRecords({ contacts, projects, qualifications })
    setReady(true)
  }, [token])

  useEffect(() => {
    let active = true
    Promise.resolve()
      .then(loadRecords)
      .catch((error) => {
        if (active) setPageError(error.message || t('admin.loadError'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [loadRecords, t])

  return (
    <div className="page-wrap inner-page admin-page">
      <PageIntro eyebrow={t('admin.eyebrow')} title={t('admin.title')} description={t('admin.intro', { name: user.name, role: isAdmin ? t('admin.administrator') : t('admin.user') })} />
      {roleError && <p className="field-error" role="alert">{roleError}</p>}
      {!roleReady && !roleError && <p role="status">{t('admin.checkingRole')}</p>}
      {roleReady && !isAdmin && <p className="admin-notice">{t('admin.readOnly')}</p>}
      {loading && <p role="status">{t('admin.loading')}</p>}
      {pageError && <p className="field-error" role="alert">{pageError}</p>}
      {roleReady && !loading && ready && Object.keys(api).map((resource) => (
        <ResourcePanel
          key={resource}
          resource={resource}
          token={token}
          canEdit={isAdmin}
          records={records[resource]}
          onChanged={loadRecords}
          setPageError={setPageError}
        />
      ))}
      {roleReady && isAdmin && <UsersPanel token={token} currentUserId={recordId(user)} />}
    </div>
  )
}

export default AdminPage
