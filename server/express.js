import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import config from '../config/config.js'
import authRoutes from './routes/auth.routes.js'
import contactRoutes from './routes/contact.routes.js'
import projectRoutes from './routes/project.routes.js'
import qualificationRoutes from './routes/qualification.routes.js'
import userRoutes from './routes/user.routes.js'
import { errorHandler } from './middleware/error-handler.js'

const app = express()
const allowedOrigins = new Set(config.clientOrigins)

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({
	origin(origin, callback) {
		if (!origin || allowedOrigins.has(origin)) return callback(null, true)
		return callback(new Error('Origin is not allowed by CORS.'))
	},
}))
app.use(express.json({ limit: '20kb' }))
app.use(express.urlencoded({ extended: false, limit: '20kb' }))

app.get('/', (req, res) => {
	res.status(200).json({ message: 'Welcome to the MyPortfolio API.' })
})
app.get('/api/health', (req, res) => {
	res.status(200).json({ status: 'ok', service: 'MyPortfolio API' })
})

app.use('/api/auth', authRoutes)
app.use('/api/contacts', contactRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/qualifications', qualificationRoutes)
app.use('/api/users', userRoutes)

app.use((req, res) => {
	res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` })
})
app.use(errorHandler)

export default app
