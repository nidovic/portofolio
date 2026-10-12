import 'dotenv/config'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  AlignmentType,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  WidthType,
} from 'docx'
import config from '../config/config.js'
import { connectDatabase } from '../server/db/connect.js'
import Contact from '../server/models/contact.model.js'
import Project from '../server/models/project.model.js'
import Qualification from '../server/models/qualification.model.js'
import User from '../server/models/user.model.js'

const outputPath = resolve('evidence/Assignment2-Evidence.docx')

function paragraph(text, options = {}) {
  return new Paragraph({ children: [{ text, ...options }], spacing: { after: 140 } })
}

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ text, heading: level, spacing: { before: 240, after: 120 } })
}

function makeTable(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map((row) => new TableRow({
      children: row.map((cell) => new TableCell({
        children: [new Paragraph(String(cell))],
      })),
    })),
  })
}

async function addScreenshot(children, fileName, caption, width, height) {
  const screenshotPath = resolve('evidence', fileName)
  const data = await readFile(screenshotPath)
  children.push(new Paragraph({ children: [new ImageRun({ data, type: 'png', transformation: { width, height } })] }))
  children.push(paragraph(caption, { italics: true }))
}

async function generateEvidenceDocument() {
  await connectDatabase()
  const counts = await Promise.all([
    Contact.countDocuments(),
    Project.countDocuments(),
    Qualification.countDocuments(),
    User.countDocuments(),
  ])
  await import('mongoose').then(({ default: mongoose }) => mongoose.disconnect())

  const content = [
    new Paragraph({ text: 'MyPortfolio — Assignment 2 Evidence', heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
    paragraph('Lodovic Rothney Feutse Nziko · Node.js, Express, MongoDB, Mongoose, React'),
    paragraph(`Generated ${new Date().toLocaleString('en-CA')}. No credentials, passwords, or JWT values are included.`),
    heading('Full-stack setup'),
    makeTable([
      ['Check', 'Evidence'],
      ['Client', 'Vite client uses http://localhost:5173'],
      ['API', 'Express API uses http://localhost:5000'],
      ['Node.js', 'Node 26, selected with .nvmrc'],
      ['Development command', 'npm run dev starts client and backend with concurrently'],
    ]),
    heading('MongoDB database and collections'),
    paragraph(`Connected database: ${config.mongoDbName}. Current documents: contacts ${counts[0]}, projects ${counts[1]}, qualifications ${counts[2]}, users ${counts[3]}.`),
    paragraph('Attach a MongoDB Compass screenshot showing the Portfolio database and its four collections. Do not show the connection URI.'),
    heading('Backend welcome and API data'),
  ]

  await addScreenshot(content, '01-api-welcome.png', 'GET / — Welcome response from the Express API.', 600, 229)
  await addScreenshot(content, '04-api-health.png', 'GET /api/health — API health response.', 600, 229)
  await addScreenshot(content, '02-projects-api.png', 'GET /api/projects — project records returned from MongoDB.', 500, 610)
  await addScreenshot(content, '03-qualifications-api.png', 'GET /api/qualifications — qualification record returned from MongoDB.', 600, 229)
  await addScreenshot(content, '05-contact-saved.png', 'Browser form submitted successfully; the UI confirmed the database save.', 300, 665)

  content.push(
    heading('REST API test results'),
    makeTable([
      ['Resource / scenario', 'Methods and observed status'],
      ['Contacts', 'GET list 200 (admin), GET by id 200, POST 201, PUT 200, DELETE 204; missing auth 401'],
      ['Projects', 'GET list/by id 200, POST 201, PUT 200, DELETE 204; missing auth 401; user role 403'],
      ['Qualifications', 'GET list/by id 200, POST 201, PUT 200, DELETE 204; missing auth 401'],
      ['Users', 'GET list/by id 200, POST 201, PUT 200, DELETE 204; hashes excluded from JSON'],
      ['Authentication', 'Sign-up 201, sign-in 200, sign-out 200; public sign-up cannot assign admin role'],
      ['Validation', 'Invalid project body 400; deleted records return 404'],
    ]),
    paragraph('These statuses were verified by npm run test:api against the configured MongoDB database. Temporary integration-test records are removed by the script.'),
    heading('Postman screenshots to attach'),
    paragraph('Import docs/MyPortfolio.postman_collection.json. Capture each request with its response body and status for the CRUD routes, plus sign-up/sign-in, authorized admin access, and an unauthorized 401/403 request. Fill Postman variables locally; mask Authorization tokens and do not include passwords.'),
    paragraph('Also attach a server-terminal screenshot showing “Connected to MongoDB database Portfolio” and the welcome response. Never include .env, MongoDB credentials, admin passwords, or JWTs.'),
  )

  const document = new Document({ sections: [{ children: content }] })
  await writeFile(outputPath, await Packer.toBuffer(document))
  console.info(`Evidence document created at ${outputPath}`)
}

generateEvidenceDocument().catch((error) => {
  console.error(`Could not generate evidence document: ${error.message}`)
  process.exitCode = 1
})