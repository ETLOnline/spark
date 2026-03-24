
import { FindUserWildCardAction } from "@/src/server-actions/User/FindUserWildCardAction";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ wildcard: string }> }) {
  const resolvedParams = await params;
  try {
    const user = await FindUserWildCardAction(resolvedParams.wildcard);
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
