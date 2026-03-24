
import { GetProjectByIdAction } from "@/src/server-actions/ProjectManagement/projectManagement";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = await params;
  try {
    const { searchParams } = new URL(req.url);
    const WithChannelAndSpace = searchParams.get("WithChannelAndSpace") === "true";
    const result = await GetProjectByIdAction(resolvedParams.projectId, WithChannelAndSpace);
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
