
import { GetJoinedCommunitiesAction } from "@/src/server-actions/Community/Community";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /community/joined:
 *   get:
 *     summary: Get joined communities
 *     description: Retrieves a list of communities that the authenticated user has joined.
 *     operationId: getJoinedCommunities
 *     tags:
 *       - Community
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of items per page for pagination.
 *     responses:
 *       '200':
 *         description: Joined communities retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     communities:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Community'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filters = Object.fromEntries(searchParams.entries());
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const result = await GetJoinedCommunitiesAction(filters, page, limit);
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
