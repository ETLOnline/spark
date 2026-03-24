
import { MarkNotificationAsReadAction } from "@/src/server-actions/Notification/Notification";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /notification/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     description: Marks a specific notification as read by its ID.
 *     operationId: markNotificationAsRead
 *     tags:
 *       - Notification
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the notification to mark as read.
 *     responses:
 *       '200':
 *         description: Notification marked as read successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const result = await MarkNotificationAsReadAction(Number(resolvedParams.id));
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
