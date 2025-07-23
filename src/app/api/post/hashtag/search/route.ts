
import { SearchHashtagsAction } from "@/src/server-actions/Post/Post";
import { NextResponse } => "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get("searchTerm");
    if (!searchTerm) {
      return new NextResponse(
        JSON.stringify({
          message: "searchTerm is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    const result = await SearchHashtagsAction(searchTerm);
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
