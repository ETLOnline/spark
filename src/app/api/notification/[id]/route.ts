
import { DeleteNotificationAction } from "@/src/server-actions/Notification/Notification";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /notification/{id}:
 *   delete:
 *     summary: Delete a notification
 *     description: Deletes a specific notification by its ID.
 *     operationId: deleteNotification
 *     tags:
 *       - Notification
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the notification to delete.
 *     responses:
 *       '200':
 *         description: Notification deleted successfully.
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
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const result = await DeleteNotificationAction(Number(resolvedParams.id));
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
