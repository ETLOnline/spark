
import { attachSpaceFeaturesAction } from "@/src/server-actions/Feature/Feature";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /feature/attach-space:
 *   post:
 *     summary: Attach features to a space
 *     description: Attaches one or more features to a specific space.
 *     operationId: attachSpaceFeatures
 *     tags:
 *       - Feature
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               spaceId:
 *                 type: string
 *                 description: The ID of the space to attach features to.
 *                 example: "space_abc"
 *               featureIds:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: An array of feature IDs to attach.
 *                 example:
 *                   - 1
 *                   - 2
 *             required:
 *               - spaceId
 *               - featureIds
 *     responses:
 *       '200':
 *         description: Features attached to space successfully.
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
 *                   description: The updated space object.
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(req: Request) {
  try {
    const { spaceId, featureIds } = await req.json();
    const result = await attachSpaceFeaturesAction(spaceId, featureIds);
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
