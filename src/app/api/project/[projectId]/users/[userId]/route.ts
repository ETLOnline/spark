
import { RemoveProjectUserAction, UpdateProjectUserRoleAction } from "@/src/server-actions/ProjectManagement/projectManagement";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { projectId: string; userId: string } }
) {
  try {
    const { roleId } = await req.json();
    const result = await RemoveProjectUserAction(params.projectId, params.userId, roleId);
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

export async function PUT(
  req: Request,
  { params }: { params: { projectId: string; userId: string } }
) {
  try {
    const { role } = await req.json();
    const result = await UpdateProjectUserRoleAction(params.projectId, params.userId, role);
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
