import { NextRequest, NextResponse } from "next/server"
import { AddRewardAction } from "@/src/server-actions/Reward/Reward"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action_type, user_id, proof_url } = body

    if (!action_type || !user_id || !proof_url) {
      return NextResponse.json(
        {
          success: false,
          error: "action_type, user_id and proof_url are required"
        },
        { status: 400 }
      )
    }

    const result = await AddRewardAction(action_type, user_id, proof_url)
    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message })
  }
}
