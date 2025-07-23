
import { GetSpaceBySlugAction } from "@/src/server-actions/Space/Space";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { channelSlug: string; spaceSlug: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const withSpaceUsers = searchParams.get("withSpaceUsers") === "true";
    const result = await GetSpaceBySlugAction(params.spaceSlug, params.channelSlug, withSpaceUsers);
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
