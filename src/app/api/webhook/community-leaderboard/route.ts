import { UpdateCommunityLeaderboardAction } from "@/src/server-actions/Communities/UpdateLeaderboard"
export async function POST(req: Request) {
  try {
    const result = await UpdateCommunityLeaderboardAction()

    if (result.success) {
      return Response.json({ success: true, data: result.data })
    } else {
      return Response.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Leaderboard update failed:", error)
    return Response.json(
      { success: false, error: "Failed to update leaderboard" },
      { status: 500 }
    )
  }
}
