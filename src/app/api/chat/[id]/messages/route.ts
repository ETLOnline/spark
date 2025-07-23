
import { GetChatWithMessagesAction } from "@/src/server-actions/Chat/Chat";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /chat/{id}/messages:
 *   get:
 *     summary: Get chat with messages by ID
 *     description: Retrieves a chat and its associated messages by chat ID.
 *     operationId: getChatWithMessagesById
 *     tags:
 *       - Chat
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the chat to retrieve.
 *     responses:
 *       '200':
 *         description: Chat and messages retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatWithMessages'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await GetChatWithMessagesAction(Number(params.id));
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
