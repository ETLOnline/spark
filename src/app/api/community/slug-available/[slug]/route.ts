
import { IsCommunitySlugAvailableAction } from "@/src/server-actions/Community/Community";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /community/slug-available/{slug}:
 *   get:
 *     summary: Check if community slug is available
 *     description: Checks if a given community slug is available for use.
 *     operationId: isCommunitySlugAvailable
 *     tags:
 *       - Community
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: The slug to check for availability.
 *       - in: query
 *         name: communityId
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional. The ID of the community to exclude from the check (for updates).
 *     responses:
 *       '200':
 *         description: Slug availability check successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: boolean
 *                   description: True if the slug is available, false otherwise.
 *                   example: true
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  try {
    const { searchParams } = new URL(req.url);
    const communityId = searchParams.get("communityId") || undefined;
    const result = await IsCommunitySlugAvailableAction(resolvedParams.slug, communityId);
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

