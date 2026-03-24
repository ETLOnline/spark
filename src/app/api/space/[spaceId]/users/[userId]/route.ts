
import { DetachSpaceUserAction, UpdateSpaceUserAction } from "@/src/server-actions/Space/Space";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: Promise<{ spaceId: string; userId: string }> }) {
  const resolvedParams = await params;
  try {
    const { roleId } = await req.json();
    const result = await DetachSpaceUserAction(resolvedParams.spaceId, resolvedParams.userId, roleId);
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

export async function PUT(req: Request, { params }: { params: Promise<{ spaceId: string; userId: string }> }) {
  const resolvedParams = await params;
  try {
    const data = await req.json();
    const result = await UpdateSpaceUserAction(resolvedParams.spaceId, resolvedParams.userId, data);
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
