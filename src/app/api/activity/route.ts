
import { AddActivityAction } from "@/src/server-actions/Activity/Activity";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /activity:
 *   post:
 *     summary: Add new activities
 *     description: Adds one or more new activities to the system.
 *     operationId: addActivity
 *     tags:
 *       - Activity
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/InsertActivity'
 *     responses:
 *       '200':
 *         description: Activities added successfully.
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
 *                     $ref: '#/components/schemas/Activity'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await AddActivityAction(data);
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
