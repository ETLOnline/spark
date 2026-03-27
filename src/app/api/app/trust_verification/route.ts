import { NextRequest, NextResponse } from "next/server"
import { UpdateTrustVerificationAction } from "@/src/server-actions/Reward/Reward"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { verification_id, status, feedback } = body

    if (!verification_id || status || feedback) {
      return NextResponse.json(
        {
          success: false,
          error: "verification_id, status and feedback are required"
        },
        { status: 400 }
      )
    }

    const result = await UpdateTrustVerificationAction(verification_id, status, feedback)
    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message })
  }
}
