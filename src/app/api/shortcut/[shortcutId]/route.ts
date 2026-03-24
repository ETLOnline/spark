
import { deleteShortcutAction } from "@/src/server-actions/Shortcut/Shortcut";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: Promise<{ shortcutId: string }> }) {
  const resolvedParams = await params;
  try {
    const result = await deleteShortcutAction(resolvedParams.shortcutId);
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
