
import { GetCommunityDetailsAction } from "@/src/server-actions/Community/Community";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /community/slug/{slug}:
 *   get:
 *     summary: Get community details by slug
 *     description: Retrieves detailed information about a community using its slug.
 *     operationId: getCommunityDetailsBySlug
 *     tags:
 *       - Community
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: The slug of the community to retrieve.
 *     responses:
 *       '200':
 *         description: Community details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Community'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const result = await GetCommunityDetailsAction(params.slug);
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
