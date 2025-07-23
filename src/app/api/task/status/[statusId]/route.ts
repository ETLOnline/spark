
import { UpdateTaskStatusAction, DeleteTaskStatusAction } from "@/src/server-actions/Tasks/Task";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { statusId: string } }
) {
  try {
    const data = await req.json();
    const result = await UpdateTaskStatusAction(params.statusId, data);
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
  { params }: { params: { statusId: string } }
) {
  try {
    const result = await DeleteTaskStatusAction(params.statusId);
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
