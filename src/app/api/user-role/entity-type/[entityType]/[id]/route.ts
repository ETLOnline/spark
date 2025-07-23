
import { getRoleByEntityTypeAndIdAction } from "@/src/server-actions/UserRoles/UserRole";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { entityType: "CHANNEL" | "SPACE" | "PROJECT" | "COMMUNITY"; id: string } }
) {
  try {
    const result = await getRoleByEntityTypeAndIdAction(params.entityType, params.id);
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
