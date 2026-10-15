import { GenerateReportSnapshotAction } from "@/src/server-actions/Reporting/Reporting"

export async function POST(req: Request) {
  try {
    const result = await GenerateReportSnapshotAction()

    if (!result?.success) {
      return Response.json(
        { success: false, error: "Report snapshot generation failed" },
        { status: 500 }
      )
    }

    return Response.json({ success: true, data: result.data })
  } catch (error) {
    console.error("Report snapshot cron failed:", error)
    return Response.json(
      { success: false, error: "Failed to generate report snapshot" },
      { status: 500 }
    )
  }
}
