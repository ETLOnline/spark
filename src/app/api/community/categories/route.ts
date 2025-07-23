
import { GetCommunityCategoriesAction } from "@/src/server-actions/Community/Community";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /community/categories:
 *   get:
 *     summary: Get community categories
 *     description: Retrieves a list of available community categories.
 *     operationId: getCommunityCategories
 *     tags:
 *       - Community
 *     responses:
 *       '200':
 *         description: Community categories retrieved successfully.
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Technology"
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(req: Request) {
  try {
    const result = await GetCommunityCategoriesAction();
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
