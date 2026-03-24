
import { GetSpaceUsersAction, AttachSpaceUserAction } from "@/src/server-actions/Space/Space";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ spaceId: string }> }) {
  const resolvedParams = await params;
  try {
    const result = await GetSpaceUsersAction(resolvedParams.spaceId);
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

export async function POST(req: Request, { params }: { params: Promise<{ spaceId: string }> }) {
  const resolvedParams = await params;
  try {
    const { userId } = await req.json();
    const result = await AttachSpaceUserAction(resolvedParams.spaceId, userId);
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
