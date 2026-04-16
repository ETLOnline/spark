export async function handleCleanupOldJobs() {
  const { db } = await import("@/src/db")
  const { jobsTable } = await import("@/src/db/schema")
  const { eq, and, lte } = await import("drizzle-orm")

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1_000)
  await db
    .delete(jobsTable)
    .where(
      and(eq(jobsTable.status, "done"), lte(jobsTable.updated_at, sevenDaysAgo))
    )
  console.log("[jobs] Cleaned up done jobs older than 7 days")
}
