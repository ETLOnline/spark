
import { DetachSpaceUserAction, UpdateSpaceUserAction } from "@/src/server-actions/Space/Space";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { spaceId: string; userId: string } }
) {
  try {
    const { roleId } = await req.json();
    const result = await DetachSpaceUserAction(params.spaceId, params.userId, roleId);
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

export async function PUT(
  req: Request,
  { params }: { params: { spaceId: string; userId: string } }
) {
  try {
    const data = await req.json();
    const result = await UpdateSpaceUserAction(params.spaceId, params.userId, data);
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
