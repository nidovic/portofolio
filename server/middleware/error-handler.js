export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error)

  if (error.code === 11000) {
    return res.status(409).json({ error: 'A record with that unique value already exists.' })
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'The supplied record id is invalid.' })
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  const status = Number.isInteger(error.statusCode) ? error.statusCode : 500
  if (status >= 500) console.error(error)
  return res.status(status).json({ error: status >= 500 ? 'Internal server error.' : error.message })
}