
import {
  CreateContactAction,
  GetContactAction,
  DeleteContactAction,
} from "@/src/server-actions/Contact/Contact";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Create a new contact request
 *     description: Initiates a new contact request to another user.
 *     operationId: createContact
 *     tags:
 *       - Contact
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contact_id:
 *                 type: string
 *                 description: The ID of the user to send a contact request to.
 *                 example: "user_target"
 *             required:
 *               - contact_id
 *     responses:
 *       '200':
 *         description: Contact request created successfully.
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
 *   get:
 *     summary: Get a specific contact
 *     description: Retrieves details of a specific contact between two users.
 *     operationId: getContact
 *     tags:
 *       - Contact
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the first user in the contact relationship.
 *       - in: query
 *         name: contact_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the second user in the contact relationship.
 *     responses:
 *       '200':
 *         description: Contact retrieved successfully.
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
 *       '400':
 *         description: Bad Request - user_id and contact_id are required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete a contact
 *     description: Deletes a contact relationship between two users.
 *     operationId: deleteContact
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
 *                 description: The ID of the first user in the contact relationship.
 *                 example: "user_initiator"
 *               contact_id:
 *                 type: string
 *                 description: The ID of the second user in the contact relationship.
 *                 example: "user_target"
 *             required:
 *               - user_id
 *               - contact_id
 *     responses:
 *       '200':
 *         description: Contact deleted successfully.
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
export async function POST(req: Request) {
  try {
    const { contact_id } = await req.json();
    const result = await CreateContactAction(contact_id);
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    const contact_id = searchParams.get("contact_id");

    if (!user_id || !contact_id) {
      return new NextResponse(
        JSON.stringify({
          message: "user_id and contact_id are required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    const result = await GetContactAction(user_id, contact_id);
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
    const result = await DeleteContactAction(user_id, contact_id);
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
