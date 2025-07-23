
import { updateUserRoleForEntityAction } from "@/src/server-actions/UserRoles/UserRole";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const { userId, entityId, entityType, newRoleId, oldRoleId, newRoleName } = await req.json();
    const result = await updateUserRoleForEntityAction(userId, entityId, entityType, newRoleId, oldRoleId, newRoleName);
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
