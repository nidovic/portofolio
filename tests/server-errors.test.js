import assert from 'node:assert/strict'
import { test } from 'node:test'
import express from 'express'
import assetsRouter from '../server/assets-router.js'
import errorController from '../server/controllers/error.controller.js'
import dbErrorHandler from '../server/helpers/dbErrorHandler.js'
import { errorHandler } from '../server/middleware/error-handler.js'
import contactController from '../server/controllers/contact.controller.js'
import projectController from '../server/controllers/project.controller.js'
import qualificationController from '../server/controllers/qualification.controller.js'
import userController from '../server/controllers/user.controller.js'

test('error middleware maps known errors and hides internal details', () => {
  const cases = [
    [{ code: 11000 }, 409, 'A record with that unique value already exists.'],
    [{ name: 'CastError' }, 400, 'The supplied record id is invalid.'],
    [{ name: 'ValidationError', message: 'invalid field' }, 400, 'invalid field'],
    [{ statusCode: 403, message: 'Forbidden' }, 403, 'Forbidden'],
    [{ statusCode: 503, message: 'private detail' }, 503, 'Internal server error.'],
  ]
  const originalError = console.error
  const logged = []
  console.error = (error) => logged.push(error)
  try {
    for (const [error, status, message] of cases) {
      const res = {
        status(value) { assert.equal(value, status); return this },
        json(value) { assert.deepEqual(value, { error: message }); return value },
      }
      errorHandler(error, {}, res, () => assert.fail('unexpected next'))
    }
    assert.equal(logged.length, 1)
    const error = new Error('already sent')
    errorHandler(error, {}, { headersSent: true }, (value) => assert.equal(value, error))
  } finally {
    console.error = originalError
  }
})

test('legacy database error formatter reports duplicate and validation errors', () => {
  assert.equal(dbErrorHandler.getErrorMessage({ code: 11000, message: 'index: collection.$email_1 dup key' }), 'Email already exists')
  assert.equal(dbErrorHandler.getErrorMessage({ code: 11001, message: null }), 'Unique field already exists')
  assert.equal(dbErrorHandler.getErrorMessage({ code: 123 }), 'Something went wrong')
  assert.equal(dbErrorHandler.getErrorMessage({ errors: { name: { message: 'Name required' } } }), 'Name required')
})

test('legacy error controller reports the provided message', () => {
  const originalLog = console.log
  const messages = []
  console.log = (value) => messages.push(value)
  try {
    errorController.handleError({}, {})
    errorController.getErrorMessage('test error')
    assert.deepEqual(messages, ['test error'])
  } finally {
    console.log = originalLog
  }
})

test('resource controllers reject invalid identifiers even when called directly', async () => {
  for (const controller of [contactController, projectController, qualificationController, userController]) {
    for (const operation of ['read', 'update', 'remove']) {
      const res = {
        status(value) { assert.equal(value, 400); return this },
        json(value) { assert.match(value.error, /id is invalid/); return value },
      }
      await controller[operation]({ params: { id: 'invalid' } }, res)
    }
  }
})

test('asset router redirects images and videos to the legacy source path', async () => {
  const app = express()
  app.use(assetsRouter)
  const server = await new Promise((resolve) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener))
  })
  try {
    for (const path of ['/image.png', '/movie.mp4']) {
      const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`, { redirect: 'manual' })
      assert.equal(response.status, 303)
      assert.equal(response.headers.get('location'), `http://localhost:3000/src${path}`)
    }
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  }
})
