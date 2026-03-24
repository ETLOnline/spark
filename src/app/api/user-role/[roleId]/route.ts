
import { deleteRoleAction } from "@/src/server-actions/UserRoles/UserRole";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: Promise<{ roleId: string }> }) {
  const resolvedParams = await params;
  try {
    const result = await deleteRoleAction(Number(resolvedParams.roleId));
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
