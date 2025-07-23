
import { getFeaturesAction } from "@/src/server-actions/Feature/Feature";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /feature:
 *   get:
 *     summary: Get features
 *     description: Retrieves a list of features, optionally filtered by properties.
 *     operationId: getFeatures
 *     tags:
 *       - Feature
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter features by name.
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter features by type.
 *     responses:
 *       '200':
 *         description: Features retrieved successfully.
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
 *                     $ref: '#/components/schemas/Feature'
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
    const result = await getFeaturesAction(filters);
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
