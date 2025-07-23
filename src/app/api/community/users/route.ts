
import { GetCommunityUsersAction, AttachCommunityUserAction } from "@/src/server-actions/Community/Community";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /community/users:
 *   get:
 *     summary: Get community users
 *     description: Retrieves a list of users associated with a specific community.
 *     operationId: getCommunityUsers
 *     tags:
 *       - Community
 *     parameters:
 *       - in: query
 *         name: communityId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the community to retrieve users for.
 *     responses:
 *       '200':
 *         description: Community users retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CommunityUser'
 *       '400':
 *         description: Bad Request - communityId is required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Attach user to a community
 *     description: Attaches a user to a specific community.
 *     operationId: attachCommunityUser
 *     tags:
 *       - Community
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               communityId:
 *                 type: string
 *                 description: The ID of the community.
 *                 example: "community_abc"
 *               userId:
 *                 type: string
 *                 description: The ID of the user to attach.
 *                 example: "user_123"
 *             required:
 *               - communityId
 *               - userId
 *     responses:
 *       '200':
 *         description: User attached to community successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CommunityUser'
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
    const communityId = searchParams.get("communityId");
    if (!communityId) {
      return new NextResponse(
        JSON.stringify({
          message: "communityId is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    const result = await GetCommunityUsersAction(communityId);
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
    const { communityId, userId } = await req.json();
    const result = await AttachCommunityUserAction(communityId, userId);
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
