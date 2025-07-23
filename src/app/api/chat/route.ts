
import { GetChatsAction } from "@/src/server-actions/Chat/Chat";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /chat:
 *   get:
 *     summary: Get chats for the authenticated user
 *     description: Retrieves a list of chats for the authenticated user, optionally filtered by space ID.
 *     operationId: getChats
 *     tags:
 *       - Chat
 *     parameters:
 *       - in: query
 *         name: space_id
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional. The ID of the space to filter chats by.
 *     responses:
 *       '200':
 *         description: Chats retrieved successfully.
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
 *                     $ref: '#/components/schemas/Chat'
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
    const space_id = searchParams.get("space_id") || undefined;
    const result = await GetChatsAction(space_id);
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
