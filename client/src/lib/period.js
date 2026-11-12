function formatDate(value, locale) {
  const date = new Date(`${value}T00:00:00Z`)
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date)
}

export function formatPeriod(record, locale) {
  if (!record.startDate) return record.completionDate || ''
  const start = formatDate(record.startDate, locale)
  if (record.endDate) return `${start} – ${formatDate(record.endDate, locale)}`
  return locale === 'fr' ? `Début : ${start}` : `Started: ${start}`
}

export function localizedPeriod(record) {
  return { en: formatPeriod(record, 'en'), fr: formatPeriod(record, 'fr') }
}
