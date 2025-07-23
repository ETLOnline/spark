
import { getPersonasAction } from "@/src/server-actions/UserRoles/UserRole";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const result = await getPersonasAction();
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
