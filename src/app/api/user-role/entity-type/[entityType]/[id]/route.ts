
import { getRoleByEntityTypeAndIdAction } from "@/src/server-actions/UserRoles/UserRole";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ entityType: string; id: string }> }) {
  const resolvedParams = await params;
  try {
    const result = await getRoleByEntityTypeAndIdAction(resolvedParams.entityType as "CHANNEL" | "SPACE" | "PROJECT" | "COMMUNITY", resolvedParams.id);
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
