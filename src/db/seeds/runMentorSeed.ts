#!/usr/bin/env npx tsx

import { seedMentorData } from "./mentorData"

async function runMentorSeeder() {
  try {
    console.log("🌱 Starting mentor data seeding...")
    await seedMentorData()
    console.log("🎉 Mentor data seeding completed!")
    process.exit(0)
  } catch (error) {
    console.error("❌ Mentor seeding failed:", error)
    process.exit(1)
  }
}

runMentorSeeder()
