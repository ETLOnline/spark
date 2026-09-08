import { ExpireOverdueAdvisorRequestsAction } from "@/src/server-actions/AdvisorRequest/AdvisorRequest"

export async function POST(req: Request) {
  try {
    const result = await ExpireOverdueAdvisorRequestsAction()

    return Response.json({ success: true, data: result })
  } catch (error) {
    console.error("Advisor request expiry cron failed:", error)
    return Response.json(
      { success: false, error: "Failed to expire overdue advisor requests" },
      { status: 500 }
    )
  }
}
