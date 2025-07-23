import { ToggleLikeAction } from "@/src/server-actions/Post/Post";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /post/like:
 *   put:
 *     summary: Toggle like on a post
 *     description: Toggles the like status of a post for the authenticated user.
 *     operationId: toggleLike
 *     tags:
 *       - Post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *                 description: The ID of the post to like/unlike.
 *                 example: "post_123"
 *               isLiked:
 *                 type: boolean
 *                 description: Current like status of the post by the user.
 *                 example: false
 *               likes:
 *                 type: number
 *                 description: Current number of likes on the post.
 *                 example: 10
 *             required:
 *               - postId
 *               - isLiked
 *               - likes
 *     responses:
 *       '200':
 *         description: Like status toggled successfully.
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
 *                     likes:
 *                       type: number
 *                       description: The new number of likes on the post.
 *                       example: 11
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function PUT(req: Request) {
  try {
    const { postId, isLiked, likes } = await req.json();
    const result = await ToggleLikeAction(postId, isLiked, likes);
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