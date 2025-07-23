
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await AuthUserAction();
    return NextResponse.json(user);
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
