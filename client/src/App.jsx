import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PROFILE } from '@/constants/profile.js'
import { ROUTES } from '@/constants/routes.js'
import Footer from '@/components/Footer.jsx'
import Header from '@/components/Header.jsx'
import HomePage from '@/pages/HomePage.jsx'
import ProtectedRoute from '@/components/ProtectedRoute.jsx'

const AboutPage = lazy(() => import('@/pages/AboutPage.jsx'))
const ContactPage = lazy(() => import('@/pages/ContactPage.jsx'))
const EducationPage = lazy(() => import('@/pages/EducationPage.jsx'))
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage.jsx'))
const ServicesPage = lazy(() => import('@/pages/ServicesPage.jsx'))
const AuthPage = lazy(() => import('@/pages/AuthPage.jsx'))
const AdminPage = lazy(() => import('@/pages/AdminPage.jsx'))
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage.jsx'))

// Keep route declarations data-driven so path changes happen in one place.
const pageRoutes = [
  { path: ROUTES.home, element: <HomePage /> },
  { path: ROUTES.about, element: <AboutPage /> },
  { path: ROUTES.projects, element: <ProjectsPage /> },
  { path: ROUTES.education, element: <EducationPage /> },
  { path: ROUTES.services, element: <ServicesPage /> },
  { path: ROUTES.contact, element: <ContactPage /> },
  { path: ROUTES.signIn, element: <AuthPage key="signin" mode="signin" /> },
  { path: ROUTES.signUp, element: <AuthPage key="signup" mode="signup" /> },
  { path: ROUTES.unauthorized, element: <UnauthorizedPage /> },
  { path: '/admin', element: <Navigate to={ROUTES.admin} replace /> },
  { path: ROUTES.admin, element: <ProtectedRoute><AdminPage /></ProtectedRoute> },
]

function App() {
  const { pathname } = useLocation()
  const { t, i18n } = useTranslation()

  useEffect(() => {
    const activePage = Object.entries(ROUTES).find(([, path]) => path === pathname)?.[0] ?? 'home'
    const titleKey = activePage === 'signIn'
      ? 'auth.signinTitle'
      : activePage === 'signUp'
        ? 'auth.signupTitle'
        : activePage === 'unauthorized' ? 'unauthorized.title' : `nav.${activePage}`

    // Keep browser metadata aligned with the visible route and selected language.
    document.title = `${PROFILE.shortName} — ${t(titleKey)}`
    document.documentElement.lang = i18n.resolvedLanguage?.split('-')[0] ?? 'en'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [i18n.resolvedLanguage, pathname, t])

  return (
    <div className="site-shell">
      <Header />
      <main id="main-content" className="page-content">
        <Suspense fallback={<p className="page-wrap" role="status">{t('pageLoading')}</p>}>
          <Routes>
            {pageRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
            <Route path={ROUTES.notFound} element={<HomePage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default App
