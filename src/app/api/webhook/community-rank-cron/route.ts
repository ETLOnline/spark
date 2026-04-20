import { UpdateCommunityLeaderboardAction } from "@/src/server-actions/Communities/UpdateLeaderboard"
export async function POST(req: Request) {
  try {
    const result = await UpdateCommunityLeaderboardAction()

    if (!result?.success) {
      return Response.json(
        { success: false, error: "Leaderboard update failed" },
        { status: 500 }
      )
    }

    return Response.json({ success: true, data: result.data })
  } catch (error) {
    console.error("Leaderboard update failed:", error)
    return Response.json(
      { success: false, error: "Failed to update leaderboard" },
      { status: 500 }
    )
  }
}
