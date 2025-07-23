
import { GetBacklogTasksAction } from "@/src/server-actions/Tasks/Task";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filters = Object.fromEntries(searchParams.entries());
    const result = await GetBacklogTasksAction(filters);
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
