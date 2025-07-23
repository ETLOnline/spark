
import { VotePollAction } from "@/src/server-actions/Post/Post";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { postId, optionText, voteCount } = await req.json();
    const result = await VotePollAction(postId, optionText, voteCount);
    return NextResponse.json(result);
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({
        message: error.message,
      }),
      {
        status: error?.cause ?? 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
