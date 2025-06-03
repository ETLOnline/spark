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
    console.log(`🔄 Generating migration: ${migrationFullName}`)
    execSync(`npx drizzle-kit generate --name="${migrationFullName}"`, {
      stdio: "inherit"
    })

    // Find and rename snapshot
    const metaDir = path.join("src", "db", "migrations", "meta")

    if (fs.existsSync(metaDir)) {
      const files = fs
        .readdirSync(metaDir)
        .filter(
          (file) =>
            file.endsWith("_snapshot.json") &&
            file.match(/^\d{4}_snapshot\.json$/)
        ) // Only get numbered snapshots
        .sort((a, b) => {
          // Sort by the number at the beginning of the filename
          const numA = parseInt(a.split("_")[0])
          const numB = parseInt(b.split("_")[0])
          return numB - numA // Sort in descending order to get the latest first
        })

      console.log("Found snapshots:", files) // Debug log

      if (files.length > 0) {
        const latestSnapshot = files[0] // Get the first one (highest number)
        const oldPath = path.join(metaDir, latestSnapshot)
        const newPath = path.join(metaDir, `${migrationFullName}_snapshot.json`)

        fs.renameSync(oldPath, newPath)

        console.log("✅ Migration generated successfully")
        console.log(
          `🔄 Renamed: ${latestSnapshot} → ${migrationFullName}_snapshot.json`
        )

        // Find the SQL file
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
      } else {
        console.log("⚠️ No snapshot file found to rename")
      }
    } else {
      console.log("❌ Meta directory not found")
    }
  } catch (error) {
    console.error("❌ Error:", error.message)
    process.exit(1)
  }

  rl.close()
})
