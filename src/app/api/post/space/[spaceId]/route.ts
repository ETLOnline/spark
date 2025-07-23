
import { GetSpacePostsAction } from "@/src/server-actions/Post/Post";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { spaceId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "";
    const offset = searchParams.get("offset") ? Number(searchParams.get("offset")) : undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;
    const result = await GetSpacePostsAction(params.spaceId, category, offset, limit);
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
