
import { CreateFilePostAction } from "@/src/server-actions/Post/Post";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /post/file:
 *   post:
 *     summary: Create a new file post
 *     description: Creates a new post with an attached file.
 *     operationId: createFilePost
 *     tags:
 *       - Post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFilePostRequest'
 *     responses:
 *       '200':
 *         description: File post created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PostWithFile'
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
    const result = await CreateFilePostAction(data);
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
