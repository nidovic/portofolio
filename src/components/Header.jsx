import { useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n.js'
import { ROUTES } from '@/constants/routes.js'

const navigation = [
  ['home', ROUTES.home],
  ['about', ROUTES.about],
  ['projects', ROUTES.projects],
  ['education', ROUTES.education],
  ['services', ROUTES.services],
]

function Header() {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const currentLanguage = i18n.resolvedLanguage?.split('-')[0] ?? 'en'

  function selectLanguage(language) {
    // Persist only the language preference; the contact form never stores its values.
    window.localStorage.setItem('portfolio-language', language)
    i18n.changeLanguage(language)
  }

  return (
    <>
      <a className="skip-link" href="#main-content">{t('nav.skip')}</a>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" to={ROUTES.home} aria-label={t('nav.brand')}>
            <img src="/mark.svg" alt="" width="38" height="38" />
            <span>Maya Laurent<span className="brand-dot">.</span></span>
          </Link>

          <button
            className="menu-toggle"
            type="button"
            aria-label={t('nav.menu')}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <nav
            id="primary-navigation"
            className={`primary-navigation${menuOpen ? ' is-open' : ''}`}
            aria-label={t('nav.primary')}
          >
            {navigation.map(([label, path]) => (
              <NavLink
                key={path}
                to={path}
                end={path === ROUTES.home}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}
              >
                {t(`nav.${label}`)}
              </NavLink>
            ))}
            <div className="language-switch" role="group" aria-label={t('nav.language')}>
              {['en', 'fr'].map((language) => (
                <button
                  key={language}
                  type="button"
                  lang={language}
                  aria-pressed={currentLanguage === language}
                  className={currentLanguage === language ? 'is-selected' : ''}
                  onClick={() => selectLanguage(language)}
                >
                  {language.toUpperCase()}
                </button>
              ))}
            </div>
            <Link className="header-contact" to={ROUTES.contact} onClick={() => setMenuOpen(false)}>
              {t('nav.contact')} <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </header>
    </>
  )
}

export default Header