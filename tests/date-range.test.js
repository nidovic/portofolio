import assert from 'node:assert/strict'
import { test } from 'node:test'
import Project from '../server/models/project.model.js'
import Qualification from '../server/models/qualification.model.js'
import { formatPeriod } from '../client/src/lib/period.js'

const models = [
  ['project', Project, { slug: 'test-project', title: 'Test project', description: 'Test description' }],
  ['qualification', Qualification, { slug: 'test-qualification', title: 'Test qualification', description: 'Test description' }],
]

for (const [name, Model, fields] of models) {
  test(`${name}: validates dates and ordering`, async () => {
    for (const dates of [
      { startDate: '2024-02-29', endDate: '2024-03-01' },
      { startDate: '2024-02-29', endDate: '' },
      { completionDate: '2021—2026' },
    ]) {
      await new Model({ ...fields, ...dates }).validate()
    }

    for (const dates of [
      { startDate: '2023-02-29' },
      { startDate: '2024-02-30' },
      { startDate: '2024-03-01', endDate: '2024-02-29' },
      { endDate: '2024-03-01' },
      { startDate: '2024' },
    ]) {
      await assert.rejects(new Model({ ...fields, ...dates }).validate(), { name: 'ValidationError' })
    }

    const record = new Model({ ...fields, startDate: '2024-01-01', endDate: '2024-12-31' })
    record.startDate = '2025-01-01'
    await assert.rejects(record.validate(), { name: 'ValidationError' })
  })
}

test('period display preserves legacy values and formats dates in both languages', () => {
  assert.equal(formatPeriod({ completionDate: '2021—2026' }, 'fr'), '2021—2026')
  assert.equal(formatPeriod({ startDate: '2024-01-02', endDate: '2024-03-05' }, 'en'), 'Jan 2, 2024 – Mar 5, 2024')
  assert.equal(formatPeriod({ startDate: '2024-01-02' }, 'fr'), 'Début : 2 janv. 2024')
  assert.equal(formatPeriod({}, 'en'), '')
})
