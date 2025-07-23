
import { AttachChannelUserAction, DettachChannelUserAction, UpdateChannelUserAction } from "@/src/server-actions/Channel/Channel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { channelId, userId } = await req.json();
    const result = await AttachChannelUserAction(channelId, userId);
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

export async function PUT(req: Request) {
  try {
    const { channelId, userId, ...data } = await req.json();
    const result = await UpdateChannelUserAction(channelId, userId, data);
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

export async function DELETE(req: Request) {
  try {
    const { channelId, userId, roleId } = await req.json();
    const result = await DettachChannelUserAction(channelId, userId, roleId);
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
