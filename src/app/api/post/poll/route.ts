
import { CreatePollPostAction } from "@/src/server-actions/Post/Post";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /post/poll:
 *   post:
 *     summary: Create a new poll post
 *     description: Creates a new post with a poll.
 *     operationId: createPollPost
 *     tags:
 *       - Post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePollPostRequest'
 *     responses:
 *       '200':
 *         description: Poll post created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PostWithPoll'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(req: Request) {
  try {
    const { content, type, options, category, entityType, entityId } = await req.json();
    const result = await CreatePollPostAction(content, type, options, category, entityType, entityId);
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
