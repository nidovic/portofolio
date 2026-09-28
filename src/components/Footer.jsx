import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@/constants/routes.js'

function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <Link className="footer-brand" to={ROUTES.home}>Maya Laurent<span>.</span></Link>
          <p>{t('footer.note')}</p>
        </div>
        <Link className="footer-contact" to={ROUTES.contact}>
          {t('footer.contact')} <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
        <p className="footer-rights">© 2026 Maya Laurent · {t('footer.rights')}</p>
      </div>
    </footer>
  )
}

export default Footer