
import { UpdateTaskStatusAction, DeleteTaskStatusAction } from "@/src/server-actions/Tasks/Task";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ statusId: string }> }) {
  const resolvedParams = await params;
  try {
    const data = await req.json();
    const result = await UpdateTaskStatusAction(resolvedParams.statusId, data);
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

export async function DELETE(req: Request, { params }: { params: Promise<{ statusId: string }> }) {
  const resolvedParams = await params;
  try {
    const result = await DeleteTaskStatusAction(resolvedParams.statusId);
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
