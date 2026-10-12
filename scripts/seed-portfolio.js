import 'dotenv/config'
import mongoose from 'mongoose'
import { EDUCATION, PROJECTS } from '../client/src/constants/profile.js'
import config from '../config/config.js'
import { connectDatabase } from '../server/db/connect.js'
import Project from '../server/models/project.model.js'
import Qualification from '../server/models/qualification.model.js'

async function seedPortfolio() {
  await connectDatabase()

  for (const project of PROJECTS) {
    await Project.updateOne(
      { slug: project.id },
      {
        $set: {
          slug: project.id,
          title: project.name,
          completionDate: project.period,
          description: project.description.en,
          descriptionFr: project.description.fr,
          category: project.category.en,
          categoryFr: project.category.fr,
          role: project.role.en,
          roleFr: project.role.fr,
          outcome: project.outcome.en,
          outcomeFr: project.outcome.fr,
          stack: project.stack,
          image: project.image,
          imageAlt: project.imageAlt.en,
          imageAltFr: project.imageAlt.fr,
          imageKind: project.imageKind || 'photo',
          links: project.links,
        },
      },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true },
    )
  }

  for (const [index, qualification] of EDUCATION.entries()) {
    await Qualification.updateOne(
      { slug: `qualification-${index + 1}` },
      {
        $set: {
          slug: `qualification-${index + 1}`,
          title: qualification.title.en,
          titleFr: qualification.title.fr,
          completionDate: qualification.period.en,
          description: qualification.detail.en,
          descriptionFr: qualification.detail.fr,
          institution: qualification.institution,
          location: qualification.location.en,
          locationFr: qualification.location.fr,
        },
      },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true },
    )
  }

  console.info(`Portfolio seed complete: ${PROJECTS.length} projects and ${EDUCATION.length} qualifications upserted.`)
}

seedPortfolio()
  .catch((error) => {
    console.error(`Portfolio seed failed: ${error.message}`)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())