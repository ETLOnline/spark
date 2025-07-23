
import { getUserShortcutsAction, createShortcutAction } from "@/src/server-actions/Shortcut/Shortcut";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const result = await getUserShortcutsAction();
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

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await createShortcutAction(data);
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
