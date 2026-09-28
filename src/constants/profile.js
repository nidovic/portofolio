// Keep editable personal, career, and project facts here for both the site and résumé PDF.
export const PROFILE = {
  firstName: 'Ludovic',
  lastName: 'Rothney Feutse Nziko',
  fullName: 'Ludovic Rothney Feutse Nziko',
  shortName: 'Ludovic Feutse',
  initials: 'LF',
  title: {
    en: 'Full-Stack & Mobile Software Developer',
    fr: 'Développeur logiciel full-stack et mobile',
  },
  location: {
    en: 'Ontario, Canada',
    fr: 'Ontario, Canada',
  },
  phone: '(613) 818-3315',
  phoneHref: 'tel:+16138183315',
  email: 'ludovicfeutse@gmail.com',
  githubUrl: 'https://github.com/nidovic',
  avatarUrl: 'https://avatars.githubusercontent.com/u/25538310?v=4',
  resumePath: '/ludovic-feutse-nziko-resume.pdf',
  yearsExperience: '5+',
  applicationCount: '9',
  summary: {
    en: 'Full-stack and mobile developer with five years of experience delivering cross-platform products, payment platforms, APIs, and offline-first systems. I work across Flutter and React interfaces, Go and Node.js services, cloud infrastructure, and automated delivery. Bilingual in English and French.',
    fr: 'Développeur full-stack et mobile avec cinq ans d’expérience dans la livraison de produits multiplateformes, de plateformes de paiement, d’API et de systèmes offline-first. J’interviens avec Flutter et React côté interface, Go et Node.js côté services, ainsi qu’en infrastructure cloud et automatisation. Bilingue français-anglais.',
  },
  about: {
    en: 'I build software for the conditions people actually work in: mobile networks that drop, payments that cross providers, and teams that need dependable tools. Over five years I have worked across mobile, web, backend, and delivery pipelines, from early architecture through production support.',
    fr: 'Je conçois des logiciels pour les conditions réelles d’utilisation : réseaux mobiles intermittents, paiements entre plusieurs fournisseurs et équipes qui ont besoin d’outils fiables. Depuis cinq ans, je travaille sur le mobile, le web, le backend et les pipelines de livraison, de l’architecture à la mise en production.',
  },
  languages: {
    en: ['English', 'French'],
    fr: ['Anglais', 'Français'],
  },
}

export const EXPERIENCE = [
  {
    title: {
      en: 'Software Developer',
      fr: 'Développeur logiciel',
    },
    employer: 'Spreeloop',
    location: {
      en: 'Kitchener, Ontario, Canada · Remote',
      fr: 'Kitchener, Ontario, Canada · Télétravail',
    },
    period: {
      en: 'Nov 2022 — May 2026',
      fr: 'Nov. 2022 — mai 2026',
    },
    startDate: 'November 2022',
    endDate: 'May 2026',
    summary: {
      en: 'Worked remotely across Spreeloop’s Canadian and Cameroonian product ecosystem.',
      fr: 'Travail à distance au sein de l’écosystème produit canadien et camerounais de Spreeloop.',
    },
    highlights: {
      en: [
        'Architected and supervised a high-traffic delivery ecosystem spanning nine applications across iOS, Android, and web.',
        'Managed cloud provisioning with Terraform and implemented API Gateway, unified authentication, and microservices routing.',
        'Led development of Spreeloop Pay and published public npm and Dart packages.',
        'Automated chatbot and service workflows with n8n and Python; established CI/CD and automated testing for app stores, Firebase, and Vercel.',
        'Built offline-first caching with PowerSync, developed Flutter and React interfaces, and mentored junior engineers.',
      ],
      fr: [
        'Conception et supervision d’un écosystème de livraison à fort trafic couvrant neuf applications iOS, Android et web.',
        'Gestion du provisionnement cloud avec Terraform et mise en place d’une API Gateway, d’une authentification unifiée et du routage microservices.',
        'Pilotage du développement de Spreeloop Pay et publication de packages npm et Dart.',
        'Automatisation de workflows et d’un chatbot avec n8n et Python; mise en place de CI/CD et de tests automatisés.',
        'Mise en place du cache offline-first avec PowerSync, développement d’interfaces Flutter et React, et mentorat de développeurs juniors.',
      ],
    },
  },
  {
    title: {
      en: 'Full-Stack Web Developer',
      fr: 'Développeur web full-stack',
    },
    employer: 'Umdeny',
    location: {
      en: 'Yaoundé, Cameroon',
      fr: 'Yaoundé, Cameroun',
    },
    period: {
      en: 'Mar 2021 — Oct 2022',
      fr: 'Mars 2021 — oct. 2022',
    },
    startDate: 'March 2021',
    endDate: 'October 2022',
    summary: {
      en: 'Delivered responsive web interfaces and backend services for business workflows.',
      fr: 'Réalisation d’interfaces web adaptatives et de services backend pour des besoins métier.',
    },
    highlights: {
      en: [
        'Developed responsive React interfaces with clean state management and cross-browser support.',
        'Designed secure REST APIs with Node.js and Express, and translated business requirements into database models.',
        'Deployed frontend applications to Vercel and backend services to Heroku.',
      ],
      fr: [
        'Développement d’interfaces React adaptatives avec une gestion d’état claire et une compatibilité multi-navigateur.',
        'Conception d’API REST sécurisées avec Node.js et Express et modélisation des données métier.',
        'Déploiement d’interfaces sur Vercel et de services backend sur Heroku.',
      ],
    },
  },
]

export const EDUCATION = [
  {
    title: {
      en: "Bachelor's Degree in Computer Science",
      fr: 'Licence en informatique',
    },
    institution: 'African Institute of Computer Science (IAI)',
    location: {
      en: 'Yaoundé, Cameroon',
      fr: 'Yaoundé, Cameroun',
    },
    period: {
      en: 'Oct 2015 — Sep 2018',
      fr: 'Oct. 2015 — sept. 2018',
    },
    detail: {
      en: "Assessed by WES as equivalent to a Canadian bachelor's degree.",
      fr: 'Équivalence canadienne de baccalauréat évaluée par WES.',
    },
  },
]

export const SKILLS = [
  {
    id: 'mobile',
    label: { en: 'Mobile', fr: 'Mobile' },
    items: ['Flutter', 'Dart', 'PowerSync', 'MVVM / MVC', 'Real-time geolocation', 'Orange Money / MTN Money', 'Stripe'],
  },
  {
    id: 'frontend',
    label: { en: 'Front End', fr: 'Front-end' },
    items: ['React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Responsive UI'],
  },
  {
    id: 'backend',
    label: { en: 'Back End', fr: 'Back-end' },
    items: ['Go', 'Node.js', 'Express', 'Python', 'REST APIs', 'Microservices', 'API Gateway'],
  },
  {
    id: 'data-cloud',
    label: { en: 'Data & Cloud', fr: 'Données et cloud' },
    items: ['PostgreSQL', 'MongoDB Atlas', 'GCP', 'Firebase', 'PowerSync'],
  },
  {
    id: 'delivery',
    label: { en: 'DevOps, QA & Automation', fr: 'DevOps, QA et automatisation' },
    items: ['Terraform', 'Docker', 'CI/CD', 'Playwright', 'Jest', 'Flutter test', 'n8n', 'Git'],
  },
]

export const SERVICES = [
  {
    icon: 'mobile',
    title: { en: 'Cross-platform mobile apps', fr: 'Applications mobiles multiplateformes' },
    description: {
      en: 'Flutter and React Native applications built for real network conditions, live data, and mobile payment flows.',
      fr: 'Applications Flutter et React Native conçues pour les conditions réseau réelles, les données en direct et les paiements mobiles.',
    },
    tag: 'Flutter · Dart · React Native',
  },
  {
    icon: 'web',
    title: { en: 'Full-stack web platforms', fr: 'Plateformes web full-stack' },
    description: {
      en: 'Responsive React products, dashboards, and SaaS interfaces backed by maintainable services and data models.',
      fr: 'Produits React adaptatifs, tableaux de bord et interfaces SaaS soutenus par des services et modèles de données maintenables.',
    },
    tag: 'React · TypeScript · Node.js',
  },
  {
    icon: 'api',
    title: { en: 'APIs and payment integration', fr: 'API et intégration de paiements' },
    description: {
      en: 'REST APIs, service routing, authentication, and integrations with Mobile Money and card payment providers.',
      fr: 'API REST, routage de services, authentification et intégration de Mobile Money et de fournisseurs de cartes.',
    },
    tag: 'Go · Express · Orange Money · MTN · Stripe',
  },
  {
    icon: 'cloud',
    title: { en: 'Cloud delivery and automation', fr: 'Déploiement cloud et automatisation' },
    description: {
      en: 'Infrastructure as code, CI/CD, automated QA, and workflow automation from development through release.',
      fr: 'Infrastructure as code, CI/CD, QA automatisée et automatisation des workflows, du développement à la mise en production.',
    },
    tag: 'Terraform · Docker · Playwright · n8n',
  },
]

export const PROJECTS = [
  {
    id: 'spreeloop-apps',
    name: 'Spreeloop Place, Partner & Courier',
    period: '2021—2026',
    category: { en: 'Mobile · Delivery · Cameroon', fr: 'Mobile · Livraison · Cameroun' },
    description: {
      en: 'A cross-platform on-demand food and delivery ecosystem designed for intermittent mobile data, local Mobile Money, and French-first users. I architected and supervised nine iOS, Android, and web applications across customer ordering, merchant operations, and courier logistics.',
      fr: 'Un écosystème multiplateforme de commande et de livraison conçu pour les réseaux mobiles intermittents, le Mobile Money local et des utilisateurs francophones. J’ai conçu et supervisé neuf applications iOS, Android et web pour les clients, les commerçants et les coursiers.',
    },
    role: { en: 'Software Developer · Mobile, backend, cloud', fr: 'Développeur logiciel · Mobile, backend, cloud' },
    outcome: {
      en: 'The production ecosystem launched in Douala with customer, merchant, and courier applications.',
      fr: 'L’écosystème est en production à Douala avec des applications pour les clients, commerçants et coursiers.',
    },
    stack: ['Flutter', 'React Native', 'Node.js', 'GCP', 'Firestore', 'Mobile Money'],
    image: 'https://spreeloop.com/images/apps/place-logo.png',
    imageKind: 'logo',
    imageAlt: { en: 'Spreeloop Place product logo', fr: 'Logo du produit Spreeloop Place' },
    links: [
      { type: 'caseStudy', url: 'https://spreeloop.com/work/spreeloop-apps/' },
      { type: 'partnerPortal', url: 'https://partners.place.spreeloop.com/' },
      { type: 'courierPortal', url: 'https://courier.spreeloop.com/' },
    ],
  },
  {
    id: 'spreeloop-pay',
    name: 'Spreeloop Pay',
    period: '2024—2026',
    category: { en: 'Fintech · Payments', fr: 'Fintech · Paiements' },
    description: {
      en: 'A managed payment platform for Orange Money, MTN Mobile Money, and bank cards, with a merchant dashboard, transaction and withdrawal tools, and a developer REST API with sandbox.',
      fr: 'Une plateforme de paiement gérée pour Orange Money, MTN Mobile Money et les cartes bancaires, avec tableau de bord marchand, gestion des transactions et retraits, et API REST avec environnement sandbox.',
    },
    role: { en: 'Software Developer · React, API Gateway, integrations', fr: 'Développeur logiciel · React, API Gateway, intégrations' },
    outcome: {
      en: 'The merchant portal and developer integration flow are live in production.',
      fr: 'Le portail marchand et le parcours d’intégration développeur sont en production.',
    },
    stack: ['React', 'GCP API Gateway', 'REST API', 'Orange Money', 'MTN MoMo', 'Stripe'],
    image: 'https://spreeloop.com/images/case-studies/spreeloop-pay/dashboard-overview.png',
    imageAlt: { en: 'Spreeloop Pay merchant dashboard', fr: 'Tableau de bord marchand de Spreeloop Pay' },
    links: [
      { type: 'caseStudy', url: 'https://spreeloop.com/work/spreeloop-pay/' },
      { type: 'liveProduct', url: 'https://portal.pay.spreeloop.com/sign-in?redirect=/' },
    ],
  },
  {
    id: 'eitels-tours',
    name: "Eitel's Tours",
    period: '2024',
    category: { en: 'Travel · Tourism · Cameroon', fr: 'Voyage · Tourisme · Cameroun' },
    description: {
      en: 'A bilingual, mobile-responsive web experience for private cultural journeys across Cameroon, with itinerary storytelling, a gallery, and a request-access inquiry flow.',
      fr: 'Une expérience web bilingue et adaptée au mobile pour des voyages culturels privés au Cameroun, avec récits d’itinéraires, galerie et parcours de demande d’accès.',
    },
    role: { en: 'Full-Stack Web Developer · Next.js · EN/FR', fr: 'Développeur web full-stack · Next.js · FR/EN' },
    outcome: {
      en: 'A live premium tourism site introducing the Royal Cameroon Experience to international guests.',
      fr: 'Un site touristique haut de gamme en ligne présentant le Royal Cameroon Experience aux voyageurs internationaux.',
    },
    stack: ['Next.js', 'Multilingual routing', 'Responsive UI'],
    image: 'https://spreeloop.com/images/clients/eitels-tours-logo.png',
    imageKind: 'logo',
    imageAlt: { en: "Eitel's Tours brand logo", fr: "Logo de marque d'Eitel's Tours" },
    links: [
      { type: 'caseStudy', url: 'https://spreeloop.com/work/eitels-tour/' },
      { type: 'liveProduct', url: 'https://www.eitelstours.net/en' },
    ],
  },
  {
    id: 'yengafrica',
    name: 'Yengafrica',
    period: '2024',
    category: { en: 'Marketplace · Tourism · Cameroon', fr: 'Marketplace · Tourisme · Cameroun' },
    description: {
      en: 'A mobile-first marketplace for discovering and booking more than 300 tours and activities across Cameroon, with multi-currency checkout and tools for service providers.',
      fr: 'Une marketplace mobile-first pour découvrir et réserver plus de 300 circuits et activités au Cameroun, avec paiement multidevise et outils destinés aux prestataires.',
    },
    role: { en: 'Full-Stack Web Developer · Marketplace · Booking', fr: 'Développeur web full-stack · Marketplace · Réservation' },
    outcome: {
      en: 'A live platform connecting travelers with bookable local experiences across Cameroon.',
      fr: 'Une plateforme en ligne reliant les voyageurs à des expériences locales réservables dans tout le Cameroun.',
    },
    stack: ['Marketplace', 'Booking flows', 'Multi-currency', 'Responsive UI'],
    image: 'https://spreeloop.com/images/clients/yengafrica-logo.png',
    imageKind: 'logo',
    imageAlt: { en: 'Yengafrica brand logo', fr: 'Logo de marque Yengafrica' },
    links: [
      { type: 'caseStudy', url: 'https://spreeloop.com/work/yenga-africa/' },
      { type: 'liveProduct', url: 'https://yengafrica.com/' },
    ],
  },
  {
    id: 'place-bot',
    name: 'Place Bot',
    period: '',
    category: { en: 'Automation · Conversational AI', fr: 'Automatisation · IA conversationnelle' },
    description: {
      en: 'A bilingual Telegram food-ordering bot that extracts order details, confirms them with the customer, and creates orders through the Spreeloop API.',
      fr: 'Un bot Telegram bilingue de commande de repas qui extrait les détails, les confirme avec le client et crée les commandes via l’API Spreeloop.',
    },
    role: { en: 'Developer · Python · NLP · Spreeloop API', fr: 'Développeur · Python · NLP · API Spreeloop' },
    outcome: {
      en: 'Natural-language order capture in English and French, with confirmation and order creation.',
      fr: 'Saisie de commande en langage naturel en français et en anglais, avec confirmation et création de commande.',
    },
    stack: ['Python', 'FastAPI', 'Telegram', 'Gemini', 'Groq', 'Spreeloop API'],
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=85',
    imageAlt: { en: 'Food prepared for an online order', fr: 'Repas préparé pour une commande en ligne' },
    links: [{ type: 'github', url: 'https://github.com/nidovic/food-ordering' }],
  },
]