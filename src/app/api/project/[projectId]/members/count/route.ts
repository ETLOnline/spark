
import { countProjectMembersAction } from "@/src/server-actions/ProjectManagement/projectManagement";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = await params;
  try {
    const result = await countProjectMembersAction(resolvedParams.projectId);
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
