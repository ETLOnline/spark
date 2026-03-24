
import { IsSlugAvailableAction } from "@/src/server-actions/Space/Space";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  try {
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get("channelId");
    if (!channelId) {
      return new NextResponse(
        JSON.stringify({
          message: "channelId is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    const result = await IsSlugAvailableAction(resolvedParams.slug, channelId);
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
