function PageIntro({ eyebrow, title, description }) {
  return (
    <header className="page-intro">
      <p className="eyebrow"><span className="eyebrow-dot" />{eyebrow}</p>
      <h1>{title}</h1>
      {description && <p className="page-intro__description">{description}</p>}
    </header>
  )
}

export default PageIntro