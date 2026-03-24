
import { GetPostByIdAction, DeletePostAction } from "@/src/server-actions/Post/Post";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const resolvedParams = await params;
  try {
    const result = await GetPostByIdAction(resolvedParams.postId);
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

export async function DELETE(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const resolvedParams = await params;
  try {
    const result = await DeletePostAction(resolvedParams.postId);
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
