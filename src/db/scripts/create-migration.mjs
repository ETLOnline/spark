import { execSync } from "child_process"
import fs from "fs"
import path from "path"
import readline from "readline"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question("Enter migration name: ", (migrationName) => {
  if (!migrationName.trim()) {
    console.log("❌ Migration name cannot be empty")
    process.exit(1)
  }

  // Replace spaces with underscores and sanitize
  const sanitizedName = migrationName
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")

  // Create timestamp
  const now = new Date()
  const timestamp =
    now.getFullYear() +
    "_" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "_" +
    String(now.getDate()).padStart(2, "0") +
    "_" +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0")

  const migrationFullName = `${timestamp}__${sanitizedName}`

  try {
    const metaDir = path.join("src", "db", "migrations", "meta")

    if (!fs.existsSync(metaDir)) {
      console.log("❌ Meta directory not found")
      rl.close()
      return
    }

    const numberedPattern = /^\d{4}_snapshot\.json$/
    const before = new Set(
      fs.readdirSync(metaDir).filter((f) => numberedPattern.test(f))
    )

    console.log(`🔄 Generating migration: ${migrationFullName}`)
    execSync(`npx drizzle-kit generate --name="${migrationFullName}"`, {
      stdio: "inherit"
    })

    const after = fs.readdirSync(metaDir).filter((f) => numberedPattern.test(f))
    const newFiles = after.filter((f) => !before.has(f))

    if (newFiles.length === 1) {
      const oldPath = path.join(metaDir, newFiles[0])
      const newPath = path.join(metaDir, `${migrationFullName}_snapshot.json`)

      fs.renameSync(oldPath, newPath)

      console.log("✅ Migration generated successfully")
      console.log(
        `🔄 Renamed: ${newFiles[0]} → ${migrationFullName}_snapshot.json`
      )

      const migrationsDir = path.join("src", "db", "migrations")
      const sqlFiles = fs
        .readdirSync(migrationsDir)
        .filter(
          (file) => file.includes(migrationFullName) && file.endsWith(".sql")
        )

      if (sqlFiles.length > 0) {
        console.log(`📁 SQL: ${path.join(migrationsDir, sqlFiles[0])}`)
      }
      console.log(`📄 Snapshot: ${newPath}`)
    } else if (newFiles.length === 0) {
      // No new numbered snapshot appeared — either nothing changed, or
      // drizzle-kit already wrote it under a name not matching the raw
      // numbered pattern. Don't guess; leave it for manual inspection.
      console.log(
        "⚠️ No new snapshot file was created by this run — nothing to rename. " +
          "If schema.ts has pending changes, check meta/ manually."
      )
    } else {
      // More than one new numbered snapshot appeared in one run — this
      // means stray/orphaned numbered files were already sitting in meta/
      // before this even started. Refuse to guess which one is real.
      console.log(
        `❌ Found ${newFiles.length} new snapshot files, expected exactly 1: ${newFiles.join(", ")}`
      )
      console.log(
        "This means meta/ already had leftover numbered snapshot files before this run. " +
          "Clean those up (they're usually orphaned artifacts with no matching journal entry) and re-run."
      )
      process.exit(1)
    }
  } catch (error) {
    console.error("❌ Error:", error.message)
    process.exit(1)
  }

  rl.close()
})
