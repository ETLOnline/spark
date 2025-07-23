
import { SearchTagsForSuggestionsAction } from "@/src/server-actions/Tag/Tag";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    const type = searchParams.get("type");
    if (!name || !type) {
      return new NextResponse(
        JSON.stringify({
          message: "name and type are required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    const result = await SearchTagsForSuggestionsAction(name, type);
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
