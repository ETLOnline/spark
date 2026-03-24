
import { FindUserByUniqueIdAction } from "@/src/server-actions/User/FindUserByUniqueIdAction";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const user = await FindUserByUniqueIdAction(resolvedParams.id);
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
