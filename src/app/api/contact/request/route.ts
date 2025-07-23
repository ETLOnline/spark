
import {
  GetConnectionRequestsAction,
  AcceptConnectionAction,
  DeleteConnectionAction,
} from "@/src/server-actions/Contact/Contact";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /contact/request:
 *   get:
 *     summary: Get connection requests
 *     description: Retrieves all incoming and outgoing connection requests for the authenticated user.
 *     operationId: getConnectionRequests
 *     tags:
 *       - Contact
 *     responses:
 *       '200':
 *         description: Connection requests retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     incoming:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Contact'
 *                     outgoing:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Contact'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Accept a connection request
 *     description: Accepts a pending connection request.
 *     operationId: acceptConnection
 *     tags:
 *       - Contact
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: The ID of the user who sent the request.
 *                 example: "user_sender"
 *               contact_id:
 *                 type: string
 *                 description: The ID of the user who received the request.
 *                 example: "user_receiver"
 *             required:
 *               - user_id
 *               - contact_id
 *     responses:
 *       '200':
 *         description: Connection request accepted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete a connection request
 *     description: Deletes (declines or cancels) a connection request.
 *     operationId: deleteConnection
 *     tags:
 *       - Contact
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: The ID of the user who sent the request.
 *                 example: "user_sender"
 *               contact_id:
 *                 type: string
 *                 description: The ID of the user who received the request.
 *                 example: "user_receiver"
 *             required:
 *               - user_id
 *               - contact_id
 *     responses:
 *       '200':
 *         description: Connection request deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(req: Request) {
  try {
    const result = await GetConnectionRequestsAction();
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

export async function PUT(req: Request) {
  try {
    const { user_id, contact_id } = await req.json();
    const result = await AcceptConnectionAction(user_id, contact_id);
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

export async function DELETE(req: Request) {
  try {
    const { user_id, contact_id } = await req.json();
    const result = await DeleteConnectionAction(user_id, contact_id);
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
