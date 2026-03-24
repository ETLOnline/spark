
import { CreateCommunityAction, GetCommunitiesAction } from "@/src/server-actions/Community/Community";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /community:
 *   post:
 *     summary: Create a new community
 *     description: Creates a new community record.
 *     operationId: createCommunity
 *     tags:
 *       - Community
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InsertCommunity'
 *     responses:
 *       '200':
 *         description: Community created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Community'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   get:
 *     summary: Get communities
 *     description: Retrieves a list of communities based on provided filters.
 *     operationId: getCommunities
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
 *           default: 6
 *         description: The number of items per page for pagination.
 *       - in: query
 *         name: activeTab
 *         schema:
 *           type: string
 *           enum:
 *             - all
 *             - my
 *           default: all
 *         description: Filter communities by tab (all or my).
 *       - in: query
 *         name: createdByUserId
 *         schema:
 *           type: string
 *         description: Filter communities by creator user ID.
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *         description: Filter communities by published status.
 *     responses:
 *       '200':
 *         description: Communities retrieved successfully.
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
 *                     allCommunitiesPagination:
 *                       $ref: '#/components/schemas/Pagination'
 *                     joinedCommunities:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Community'
 *                     joinedCommunitiesPagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await CreateCommunityAction(data);
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filters = Object.fromEntries(searchParams.entries());
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 6;
    const activeTab = (searchParams.get("activeTab") as any) || "all";
    const result = await GetCommunitiesAction(filters, page, limit);
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

