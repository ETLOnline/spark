
import { GetChannelBySlugAction } from "@/src/server-actions/Channel/Channel";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  try {
    const result = await GetChannelBySlugAction(resolvedParams.slug);
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
