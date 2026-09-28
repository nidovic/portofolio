import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = resolve(projectRoot, 'public/maya-laurent-resume.pdf')
const document = await PDFDocument.create()
const page = document.addPage([595.28, 841.89])
const regularFont = await document.embedFont(StandardFonts.Helvetica)
const boldFont = await document.embedFont(StandardFonts.HelveticaBold)
const ink = rgb(0.09, 0.145, 0.13)
const muted = rgb(0.34, 0.39, 0.36)
const blue = rgb(0.19, 0.37, 0.91)
const lime = rgb(0.85, 0.96, 0.36)

function drawText(text, x, y, size, font = regularFont, color = ink) {
  page.drawText(text, { x, y, size, font, color })
}

function drawWrappedText(text, x, y, width, size = 9.5, color = muted) {
  const words = text.split(' ')
  const lines = []
  let currentLine = ''

  // Measure each line before drawing so longer summaries stay inside the page grid.
  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word
    if (regularFont.widthOfTextAtSize(candidate, size) > width && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = candidate
    }
  }
  if (currentLine) lines.push(currentLine)

  lines.forEach((line, index) => drawText(line, x, y - index * 13, size, regularFont, color))
  return y - lines.length * 13
}

function drawSectionTitle(title, y) {
  drawText(title.toUpperCase(), 44, y, 9, boldFont, blue)
  page.drawLine({ start: { x: 44, y: y - 7 }, end: { x: 551, y: y - 7 }, thickness: 0.7, color: rgb(0.84, 0.87, 0.83) })
  return y - 23
}

function drawExperience(title, company, dates, details, y) {
  drawText(title, 44, y, 11, boldFont)
  drawText(dates, 455, y, 8, boldFont, blue)
  drawText(company, 44, y - 13, 9, regularFont, muted)
  const nextY = drawWrappedText(details, 44, y - 29, 500, 9)
  return nextY - 11
}

document.setTitle('Maya Laurent - Frontend Developer Resume')
document.setAuthor('Maya Laurent')
document.setSubject('Fictional portfolio résumé for a class assignment')

page.drawRectangle({ x: 0, y: 680, width: 595.28, height: 161.89, color: ink })
page.drawRectangle({ x: 0, y: 672, width: 595.28, height: 8, color: lime })
drawText('MAYA LAURENT', 44, 786, 27, boldFont, rgb(1, 1, 1))
drawText('FRONTEND DEVELOPER', 44, 762, 11, boldFont, lime)
drawText('Thoughtful, accessible web experiences with React.', 44, 735, 10, regularFont, rgb(0.89, 0.92, 0.89))
drawText('LYON, FRANCE  |  +33 6 12 34 56 78', 44, 704, 8.5, regularFont, rgb(1, 1, 1))
drawText('MAYA.LAURENT@EXAMPLE.COM', 44, 689, 8.5, regularFont, rgb(1, 1, 1))

let cursorY = drawSectionTitle('Profile', 641)
cursorY = drawWrappedText('Frontend developer with four years of experience building responsive React interfaces for commerce, culture and community products. Focused on clear interaction design, accessible patterns and maintainable component systems.', 44, cursorY, 500, 9.5) - 19

cursorY = drawSectionTitle('Experience', cursorY)
cursorY = drawExperience('Independent Frontend Developer', 'Maya Laurent Studio | Lyon, France', '2024 - NOW', 'Partner with small product teams to design and ship accessible web experiences. Build reusable React components, responsive flows and practical quality checks.', cursorY)
cursorY = drawExperience('Frontend Developer', 'Studio Canopee | Lyon, France', '2022 - 2024', 'Delivered customer-facing features for culture and commerce clients. Collaborated with designers and product leads; improved checkout completion by 28% for a retail project.', cursorY)

cursorY = drawSectionTitle('Education & credentials', cursorY - 4)
drawText('BSc, Web Development', 44, cursorY, 10, boldFont)
drawText('Institut Numerique Rhone | Lyon, France | 2018 - 2021', 44, cursorY - 14, 9, regularFont, muted)
drawText('Meta Front-End Developer Professional Certificate | 2023', 44, cursorY - 34, 9, boldFont)

cursorY = drawSectionTitle('Skills', cursorY - 68)
drawWrappedText('React  |  JavaScript  |  HTML  |  CSS  |  Tailwind CSS  |  React Router  |  Figma  |  WCAG accessibility  |  Git  |  Responsive design', 44, cursorY, 500, 9.5)

page.drawLine({ start: { x: 44, y: 43 }, end: { x: 551, y: 43 }, thickness: 0.7, color: rgb(0.84, 0.87, 0.83) })
drawText('Fictional profile created for a portfolio assignment.', 44, 27, 8, regularFont, muted)

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, await document.save())
console.log(`Résumé generated: ${outputPath}`)