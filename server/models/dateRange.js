function isCalendarDate(value) {
  if (!value) return true
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000-')) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value
}

export function addDateRange(schema) {
  schema.add({
    startDate: { type: String, trim: true, default: '', validate: [isCalendarDate, 'Start date must be a valid YYYY-MM-DD date.'] },
    endDate: { type: String, trim: true, default: '', validate: [isCalendarDate, 'End date must be a valid YYYY-MM-DD date.'] },
  })

  schema.pre('validate', function validateDateRange() {
    if (this.endDate && !this.startDate) {
      this.invalidate('endDate', 'A start date is required when an end date is provided.')
    } else if (this.startDate && this.endDate && this.endDate < this.startDate) {
      this.invalidate('endDate', 'End date must not be before start date.')
    }
  })
}
