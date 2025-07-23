
import { savePersonaAction } from "@/src/server-actions/UserRoles/UserRole";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { personaID, userId, externalAuthId } = await req.json();
    const result = await savePersonaAction(personaID, userId, externalAuthId);
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
