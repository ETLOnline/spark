
import { GetTaskByIdAction, UpdateTaskAction, DeleteTaskAction } from "@/src/server-actions/Tasks/Task";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ taskId: string }> }) {
  const resolvedParams = await params;
  try {
    const result = await GetTaskByIdAction(resolvedParams.taskId);
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

export async function PUT(req: Request, { params }: { params: Promise<{ taskId: string }> }) {
  const resolvedParams = await params;
  try {
    const data = await req.json();
    const result = await UpdateTaskAction(resolvedParams.taskId, data);
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

export async function DELETE(req: Request, { params }: { params: Promise<{ taskId: string }> }) {
  const resolvedParams = await params;
  try {
    const data = await req.json();
    const result = await DeleteTaskAction(data);
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
