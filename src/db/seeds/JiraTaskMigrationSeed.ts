import {marked} from "marked"
import { db } from "../index"
import { getProjectById } from "../data-access/project-management/query"
import { CreateTask, GetTaskCount, GetTaskStatusList } from "../data-access/tasks/query"
import fs from "fs"
import path from "path"

// Fixed values
// const FIXED_STATUS_ID = "74aa63e9-ab68-4726-b4c4-25743c8d18d7"
const FIXED_PROJECT_ID = "08ce22b9-6738-47dd-9acf-b544d832e04d"
const FIXED_USER_ID = "27bb08c7-e89c-4b5c-bb6f-1837b55bd996"

// Story point mapping
const STORY_POINT_MAPPING = {
  highest: 10,
  high: 7,
  medium: 5,
  low: 2,
  lowest: 1
}

// Helper: get initials for project name
function getInitials(projectName: string): string {
  return projectName
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase())
    .join("")
}

// Helper: load JSON file
function loadFilteredData() {
  const filePath = path.join(process.cwd(), "public", "filtered_data.json")
  const content = fs.readFileSync(filePath, "utf8")
  return JSON.parse(content)
}

// Helper: map raw issue → task payload
function mapIssueToPayload(issue: any, FIXED_STATUS_ID:string) {
  const priority =
    ((
      issue.Priority || "low"
    ).toLowerCase() as keyof typeof STORY_POINT_MAPPING) ?? "low"

  return {
    assign_by: FIXED_USER_ID,
    assign_to: null,
    description: `${marked.parse(issue.Description)}`, //`${issue.Description || "No description"}</p>`,
    parent_task_id: null,
    status_id: FIXED_STATUS_ID,
    story_points: String(STORY_POINT_MAPPING[priority] || 2),
    task_priority: priority,
    task_title: issue.Summary || "Untitled Task",
    task_type: issue.IssueType || "task",
    project_id: FIXED_PROJECT_ID,
    sprint_id: null,
    original_issue_key: issue["Issue key"] || `UNKNOWN-${Date.now()}`,
    created_by: FIXED_USER_ID
  }
}

// --- SEEDER FUNCTION ---
export const JiraTaskMigrationSeed = async () => {
  console.log("🌱 Starting Task Seeder...")

  try {
    await db.transaction(async (tx) => {
      // get all status of the project
      const projectTaskStatus = await GetTaskStatusList(FIXED_PROJECT_ID)
      if(!projectTaskStatus) throw new Error("❌ Project task status not found")
      const toDoStatus = projectTaskStatus.find(
        (status) => status.status_slug === "to-do"
      )

      if (!toDoStatus) {
        throw new Error("❌ 'to-do' status not found for project")
      }

      const FIXED_STATUS_ID = toDoStatus.id
      // console.log("🔄 Truncating tasks table...")
      // await tx.execute(sql`TRUNCATE TABLE tasks CASCADE;`)

      const issues = loadFilteredData()
      console.log(`📦 Loaded ${issues.length} issues from filtered_data.json`)

      const project = await getProjectById(FIXED_PROJECT_ID)
      if (!project) throw new Error("❌ Project not found")

      const projectInitials = getInitials(project.project_name)

      let success = 0
      let failed = 0

      for (const issue of issues) {
        try {
          const payload = mapIssueToPayload(issue, FIXED_STATUS_ID)
          const count = await GetTaskCount(FIXED_PROJECT_ID)
          const task_num = `${projectInitials}-${count + 1}`

          await CreateTask({ ...payload, task_num })

          success++
        } catch (err) {
          failed++
          console.error(`❌ Failed for issue: ${issue["Issue key"]}`)
        }
      }

      console.log(
        `\n✅ Tasks Seed Completed: ${success} success | ❌ ${failed} failed`
      )
    })
  } catch (err) {
    console.error("❌ Error seeding tasks:", err)
    process.exit(1)
  }
}
