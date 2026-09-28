export function getLocale(language) {
  return language?.toLowerCase().split('-')[0] === 'fr' ? 'fr' : 'en'
}

export function localizedText(value, language) {
  if (typeof value === 'string') return value

  const locale = getLocale(language)
  return value?.[locale] ?? value?.en ?? ''
}