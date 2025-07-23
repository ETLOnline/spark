
import { GetChatContactsAction } from "@/src/server-actions/Chat/Chat";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /chat/contacts:
 *   get:
 *     summary: Get chat contacts
 *     description: Retrieves a list of chat contacts based on provided filters.
 *     operationId: getChatContacts
 *     tags:
 *       - Chat
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter contacts by user ID.
 *       - in: query
 *         name: contactId
 *         schema:
 *           type: string
 *         description: Filter contacts by contact ID.
 *       - in: query
 *         name: isAccepted
 *         schema:
 *           type: boolean
 *         description: Filter contacts by acceptance status.
 *     responses:
 *       '200':
 *         description: Chat contacts retrieved successfully.
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
 *                     $ref: '#/components/schemas/Contact'
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
    const filters = Object.fromEntries(searchParams.entries());
    const result = await GetChatContactsAction(filters);
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
