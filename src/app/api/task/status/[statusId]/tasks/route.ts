
import { GetTasksByStatusIdAction } from "@/src/server-actions/Tasks/Task";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { statusId: string } }
) {
  try {
    const result = await GetTasksByStatusIdAction(params.statusId);
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
