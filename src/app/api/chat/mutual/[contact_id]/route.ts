
import { GetMutualChatAction } from "@/src/server-actions/Chat/Chat";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /chat/mutual/{contact_id}:
 *   get:
 *     summary: Get mutual chat with a contact
 *     description: Retrieves the mutual chat between the authenticated user and a specified contact.
 *     operationId: getMutualChat
 *     tags:
 *       - Chat
 *     parameters:
 *       - in: path
 *         name: contact_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the contact to find the mutual chat with.
 *     responses:
 *       '200':
 *         description: Mutual chat retrieved successfully.
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
export async function GET(req: Request, { params }: { params: Promise<{ contact_id: string }> }) {
  const resolvedParams = await params;
  try {
    const result = await GetMutualChatAction(resolvedParams.contact_id);
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
