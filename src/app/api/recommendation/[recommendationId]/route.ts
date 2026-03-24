
import { GetRecommendationAction, UpdateRecommendationAction } from "@/src/server-actions/Recommendation/recommendation";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ recommendationId: string }> }) {
  const resolvedParams = await params;
  try {
    const result = await GetRecommendationAction(resolvedParams.recommendationId);
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

export async function PUT(req: Request, { params }: { params: Promise<{ recommendationId: string }> }) {
  const resolvedParams = await params;
  try {
    const data = await req.json();
    const result = await UpdateRecommendationAction(Number(resolvedParams.recommendationId), data);
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
