import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { Document, HeadingLevel, ImageRun, Packer, Paragraph } from 'docx'

const evidenceDir = resolve(process.argv[2] ?? 'evidence')
const screenshots = [
  ['00-signup-form.png', 'Sign-up form before entering synthetic account details.'],
  ['01-signup-readonly.png', 'Dashboard immediately after successful registration, showing the regular-user role.'],
  ['02-signin-readonly.png', 'Dashboard after sign-in as a regular user. Records are read-only and no administrative action buttons are present.'],
  ['03-unauthorized-api.png', 'Response to an unauthenticated GET /api/contacts request. The HTTP status was verified as 401; the browser displays the response body.'],
  ['04-contact-form.png', 'Public contact form filled with synthetic test data.'],
  ['05-contact-saved.png', 'The frontend confirms that the contact submission was saved.'],
  ['06-admin-create-form.png', 'Administrator creates a synthetic project with dates and a link.'],
  ['07-admin-created.png', 'Administrator dashboard after the project was created; the request returned 201.'],
  ['08-admin-updated.png', 'Administrator dashboard after the project was updated; the request returned 200.'],
  ['09-project-api.png', 'The project is returned by a direct API GET request (200).'],
  ['10-regular-forbidden.png', 'Generated report of an actual regular-user project creation request rejected with HTTP 403.'],
  ['11-mongodb-records.png', 'Generated report of actual MongoDB documents read directly using Mongoose, before test cleanup. This is not a MongoDB Compass screenshot.'],
  ['12-admin-deleted.png', 'Administrator dashboard after deletion. A subsequent API GET returned 404.'],
]

async function generateEvidenceDocument() {
  const children = [
    new Paragraph({ text: 'MyPortfolio — Assignment 3 Evidence', heading: HeadingLevel.TITLE }),
    new Paragraph({ text: 'Full-stack authentication, authorization, forms, API and MongoDB evidence.', spacing: { after: 180 } }),
    new Paragraph({
      text: 'The test account, contact and project are synthetic and were removed after capture. Existing contact entries are blurred for privacy. Tokens, passwords and database credentials are not included.',
      spacing: { after: 180 },
    }),
    new Paragraph({
      text: 'Long full-page screenshots are shown in consecutive segments for readability. The original, uncropped PNG files are included alongside this document.',
    }),
  ]

  for (const [fileName, caption] of screenshots) {
    const data = await readFile(resolve(evidenceDir, fileName))
    if (data.length < 24 || !data.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) {
      throw new Error(`Not a valid PNG: ${fileName}`)
    }

    const width = data.readUInt32BE(16)
    const height = data.readUInt32BE(20)
    if (!width || !height) throw new Error(`Invalid image dimensions: ${fileName}`)

    const maxSegmentHeight = Math.floor(width * 1.15)
    const segments = Math.ceil(height / maxSegmentHeight)
    for (let index = 0; index < segments; index += 1) {
      const top = index * maxSegmentHeight
      const bottom = Math.min(top + maxSegmentHeight, height)
      const displayWidth = Math.min(width, 600)
      children.push(
        new Paragraph({
          text: `${fileName}${segments > 1 ? ` — part ${index + 1} of ${segments}` : ''}`,
          heading: HeadingLevel.HEADING_2,
          pageBreakBefore: true,
        }),
        new Paragraph({ text: caption, spacing: { after: 140 } }),
        new Paragraph({
          children: [new ImageRun({
            data,
            type: 'png',
            transformation: { width: displayWidth, height: displayWidth * (bottom - top) / width },
            crop: { top: 100 * top / height, bottom: 100 * (height - bottom) / height },
          })],
        }),
      )
    }
  }

  const outputPath = resolve(evidenceDir, 'Assignment3-Evidence.docx')
  await writeFile(outputPath, await Packer.toBuffer(new Document({ sections: [{ children }] })))
  console.info(`Evidence document created at ${outputPath}`)
}

generateEvidenceDocument().catch((error) => {
  console.error(`Could not generate evidence document: ${error.message}`)
  process.exitCode = 1
})
