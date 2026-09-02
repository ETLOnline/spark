import { getEligibleRequestAdvisorsAction } from "@/src/server-actions/AdvisorRequest/AdvisorRequest"

export async function POST(req: Request) {
  try {
    const result = await getEligibleRequestAdvisorsAction()

    return Response.json({ success: true, data: result })
  } catch (error) {
    console.error("Assign advisors cron failed:", error)
    return Response.json(
      { success: false, error: "Failed to assign advisors" },
      { status: 500 }
    )
  }
}
