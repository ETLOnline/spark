
import { GetRecommendationAction, UpdateRecommendationAction } from "@/src/server-actions/Recommendation/recommendation";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { recommendationId: string } }
) {
  try {
    const result = await GetRecommendationAction(params.recommendationId);
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

export async function PUT(
  req: Request,
  { params }: { params: { recommendationId: string } }
) {
  try {
    const data = await req.json();
    const result = await UpdateRecommendationAction(Number(params.recommendationId), data);
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
