
import { CreateGroupChatAction } from "@/src/server-actions/Chat/Chat";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /chat/group:
 *   post:
 *     summary: Create a group chat
 *     description: Creates a new group chat with specified users and a chat name.
 *     operationId: createGroupChat
 *     tags:
 *       - Chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: An array of user IDs to include in the group chat.
 *                 example:
 *                   - "user123"
 *                   - "user456"
 *               chatName:
 *                 type: string
 *                 description: The name of the group chat.
 *                 example: "My Team Chat"
 *               space_id:
 *                 type: string
 *                 description: Optional. The ID of the space the chat belongs to.
 *                 example: "space789"
 *             required:
 *               - userIds
 *               - chatName
 *     responses:
 *       '200':
 *         description: Group chat created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Chat'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(req: Request) {
  try {
    const { userIds, chatName, space_id } = await req.json();
    const result = await CreateGroupChatAction(userIds, chatName, space_id);
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
