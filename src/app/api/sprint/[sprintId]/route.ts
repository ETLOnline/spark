
import { UpdateSprintAction, DeleteSprintAction } from "@/src/server-actions/Sprint/sprint";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { sprintId: string } }
) {
  try {
    const data = await req.json();
    const result = await UpdateSprintAction(params.sprintId, data);
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

export async function DELETE(
  req: Request,
  { params }: { params: { sprintId: string } }
) {
  try {
    const result = await DeleteSprintAction(params.sprintId);
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
