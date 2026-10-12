const config = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI,
  mongoDbName: process.env.MONGODB_DB_NAME || 'Portfolio',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  adminEmail: process.env.ADMIN_EMAIL?.trim().toLowerCase(),
  adminName: process.env.ADMIN_NAME?.trim(),
  adminPassword: process.env.ADMIN_PASSWORD,
}

export default config