
import { CreatePrivateChatAction } from "@/src/server-actions/Chat/Chat";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /chat/private:
 *   post:
 *     summary: Create a private chat
 *     description: Creates a new private chat between two users.
 *     operationId: createPrivateChat
 *     tags:
 *       - Chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: The ID of the first user.
 *                 example: "user123"
 *               contact_id:
 *                 type: string
 *                 description: The ID of the second user.
 *                 example: "user456"
 *               space_id:
 *                 type: string
 *                 description: Optional. The ID of the space the chat belongs to.
 *                 example: "space789"
 *             required:
 *               - user_id
 *               - contact_id
 *     responses:
 *       '200':
 *         description: Private chat created successfully.
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
    const { user_id, contact_id, space_id } = await req.json();
    const result = await CreatePrivateChatAction(user_id, contact_id, space_id);
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
