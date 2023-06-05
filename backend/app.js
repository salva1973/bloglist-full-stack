const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

logger.info(
  'connecting to',
  `${config.MONGODB_URI.split('://')[0]}://<username>:<password>${
    config.MONGODB_URI.split('://')[1].split('@')[1]
  }`
)

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI)
    logger.info('connected to MongoDB')
  } catch (error) {
    logger.error('error connecting to MongoDB:', error.message)
  }
}

connectToMongoDB()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

// Configure morgan middleware for non-POST requests in "tiny" format
app.use(
  morgan('tiny', {
    skip: (req) => req.method === 'POST', // Skip logging for POST requests
  })
)

// Configure morgan middleware for POST requests to log request body
app.use(
  morgan(
    (tokens, req, res) => {
      if (req.method === 'POST') {
        const body = req.body
        if (body.username) {
          body.username = '********'
        }
        if (body.password) {
          body.password = '********'
        }
        return [
          tokens.method(req, res),
          tokens.url(req, res),
          tokens.status(req, res),
          tokens.res(req, res, 'content-length'),
          '-',
          tokens['response-time'](req, res),
          'ms',
          JSON.stringify(req.body), // Log request body
        ].join(' ')
      }
    },
    {
      skip: (req) => req.method !== 'POST', // Skip logging for non-POST requests
    }
  )
)
/*
Note that logging data even in the console can be dangerous since it can contain sensitive data and may violate local privacy law (e.g. GDPR in EU) or business-standard. In this exercise, you don't have to worry about privacy issues, but in practice, try not to log any sensitive data.
*/

app.use(middleware.tokenExtractor)

app.use('/api/blogs', middleware.userExtractor, blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
