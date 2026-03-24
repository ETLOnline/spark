
import { getUserPermissionRowsAction } from "@/src/server-actions/UserRoles/UserRole";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const resolvedParams = await params;
  try {
    const result = await getUserPermissionRowsAction(resolvedParams.userId);
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
