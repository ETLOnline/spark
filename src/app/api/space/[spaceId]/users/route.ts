
import { GetSpaceUsersAction, AttachSpaceUserAction } from "@/src/server-actions/Space/Space";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { spaceId: string } }
) {
  try {
    const result = await GetSpaceUsersAction(params.spaceId);
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

export async function POST(
  req: Request,
  { params }: { params: { spaceId: string } }
) {
  try {
    const { userId } = await req.json();
    const result = await AttachSpaceUserAction(params.spaceId, userId);
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
