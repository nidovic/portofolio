import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageIntro from '@/components/PageIntro.jsx'
import { ROUTES } from '@/constants/routes.js'

function UnauthorizedPage() {
  const { t } = useTranslation()
  const location = useLocation()

  return (
    <div className="page-wrap inner-page auth-page">
      <PageIntro
        eyebrow={t('unauthorized.eyebrow')}
        title={t('unauthorized.title')}
        description={t('unauthorized.description')}
      />
      <Link className="action-button action-button--dark" to={ROUTES.signIn} state={{ from: location.state?.from }}>
        {t('auth.signinAction')}
      </Link>
    </div>
  )
}

export default UnauthorizedPage
