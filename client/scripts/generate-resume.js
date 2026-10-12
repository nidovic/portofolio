import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { EDUCATION, EXPERIENCE, PROFILE, PROJECTS, SKILLS } from '../src/constants/profile.js'
import { localizedText } from '../src/lib/localized.js'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = resolve(projectRoot, 'public', PROFILE.resumePath.replace(/^\//, ''))
const document = await PDFDocument.create()
const pageSize = [595.28, 841.89]
const regularFont = await document.embedFont(StandardFonts.Helvetica)
const boldFont = await document.embedFont(StandardFonts.HelveticaBold)
const ink = rgb(0.09, 0.145, 0.13)
const muted = rgb(0.34, 0.39, 0.36)
const blue = rgb(0.19, 0.37, 0.91)
const lime = rgb(0.85, 0.96, 0.36)

function pdfSafeText(text) {
  return String(text)
    .replace(/[’‘]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/·/g, '|')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, ' ')
}

function drawText(page, text, x, y, size, font = regularFont, color = ink) {
  page.drawText(pdfSafeText(text), { x, y, size, font, color })
}

function drawWrappedText(page, text, x, y, width, size = 9.5, color = muted, font = regularFont) {
  const words = pdfSafeText(text).split(/\s+/)
  const lines = []
  let currentLine = ''

  // Wrap based on embedded font metrics to keep generated text inside page margins.
  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word
    if (font.widthOfTextAtSize(candidate, size) > width && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = candidate
    }
  }
  if (currentLine) lines.push(currentLine)

  lines.forEach((line, index) => drawText(page, line, x, y - index * 12, size, font, color))
  return y - lines.length * 12
}

function drawSectionTitle(page, title, y) {
  drawText(page, title.toUpperCase(), 44, y, 9, boldFont, blue)
  page.drawLine({ start: { x: 44, y: y - 7 }, end: { x: 551, y: y - 7 }, thickness: 0.7, color: rgb(0.84, 0.87, 0.83) })
  return y - 23
}

function drawPageHeader(page, compact = false) {
  const headerHeight = compact ? 99 : 143
  const headerBottom = pageSize[1] - headerHeight
  page.drawRectangle({ x: 0, y: headerBottom, width: pageSize[0], height: headerHeight, color: ink })
  page.drawRectangle({ x: 0, y: headerBottom - 7, width: pageSize[0], height: 7, color: lime })
  drawText(page, PROFILE.fullName.toUpperCase(), 44, pageSize[1] - 48, compact ? 19 : 24, boldFont, rgb(1, 1, 1))
  drawText(page, PROFILE.title.en.toUpperCase(), 44, pageSize[1] - 70, 9.5, boldFont, lime)
  drawText(page, `${PROFILE.location.en.toUpperCase()}  |  ${PROFILE.phone}  |  ${PROFILE.email}`, 44, pageSize[1] - (compact ? 84 : 105), 7.4, regularFont, rgb(1, 1, 1))
  drawText(page, PROFILE.githubUrl.replace(/^https?:\/\//, ''), 44, pageSize[1] - (compact ? 96 : 121), 7.4, regularFont, rgb(0.89, 0.92, 0.89))
  return headerBottom - 30
}

function drawExperience(page, experience, y) {
  const rightDate = pdfSafeText(`${experience.startDate} - ${experience.endDate}`)
  const dateWidth = boldFont.widthOfTextAtSize(rightDate, 7.5)
  drawText(page, localizedText(experience.title, 'en'), 44, y, 10.5, boldFont)
  drawText(page, rightDate, 551 - dateWidth, y, 7.5, boldFont, blue)
  drawText(page, `${experience.employer} | ${localizedText(experience.location, 'en')}`, 44, y - 13, 8.3, regularFont, muted)
  let nextY = drawWrappedText(page, localizedText(experience.summary, 'en'), 44, y - 28, 500, 8.4)

  for (const highlight of experience.highlights.en) {
    page.drawCircle({ x: 48, y: nextY - 2, size: 1.6, color: blue })
    nextY = drawWrappedText(page, highlight, 57, nextY, 487, 8.1) - 2
  }

  return nextY - 7
}

function drawProject(page, project, y) {
  drawText(page, project.name, 44, y, 9.2, boldFont)
  drawText(page, project.period, 490, y, 7.4, boldFont, blue)
  let nextY = drawWrappedText(page, project.description.en, 44, y - 13, 507, 7.9)
  nextY = drawWrappedText(page, `Outcome: ${project.outcome.en}`, 44, nextY - 2, 507, 7.6, muted)
  return nextY - 6
}

function drawFooter(page, pageNumber) {
  page.drawLine({ start: { x: 44, y: 39 }, end: { x: 551, y: 39 }, thickness: 0.7, color: rgb(0.84, 0.87, 0.83) })
  drawText(page, `${PROFILE.fullName} | ${pageNumber}`, 44, 24, 7.5, regularFont, muted)
}

document.setTitle(`${PROFILE.fullName} - Resume`)
document.setAuthor(PROFILE.fullName)
document.setSubject('Professional résumé')

const firstPage = document.addPage(pageSize)
let cursorY = drawPageHeader(firstPage)
cursorY = drawSectionTitle(firstPage, 'Professional Summary', cursorY)
cursorY = drawWrappedText(firstPage, PROFILE.summary.en, 44, cursorY, 507, 9) - 16
cursorY = drawSectionTitle(firstPage, 'Work Experience', cursorY)

for (const experience of EXPERIENCE) {
  cursorY = drawExperience(firstPage, experience, cursorY)
}
drawFooter(firstPage, '1 / 2')

const secondPage = document.addPage(pageSize)
cursorY = drawPageHeader(secondPage, true)
cursorY = drawSectionTitle(secondPage, 'Key Projects', cursorY)

for (const project of PROJECTS) {
  cursorY = drawProject(secondPage, project, cursorY)
}

cursorY -= 4
cursorY = drawSectionTitle(secondPage, 'Technical Skills', cursorY)
for (const skillGroup of SKILLS) {
  drawText(secondPage, skillGroup.label.en, 44, cursorY, 8.2, boldFont)
  cursorY = drawWrappedText(secondPage, skillGroup.items.join(' | '), 166, cursorY, 380, 7.8) - 5
}

cursorY -= 2
cursorY = drawSectionTitle(secondPage, 'Education', cursorY)
for (const education of EDUCATION) {
  drawText(secondPage, education.title.en, 44, cursorY, 9, boldFont)
  drawText(secondPage, education.period.en, 465, cursorY, 7.5, boldFont, blue)
  drawText(secondPage, `${education.institution} | ${education.location.en}`, 44, cursorY - 13, 8.2, regularFont, muted)
  cursorY = drawWrappedText(secondPage, education.detail.en, 44, cursorY - 27, 507, 8) - 8
}
drawFooter(secondPage, '2 / 2')

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, await document.save())
console.log(`Résumé generated: ${outputPath}`)