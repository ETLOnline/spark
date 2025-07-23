
import { GetDirectoryContentsAction } from "@/src/server-actions/FileSharing/FileSharing";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /file-sharing/directory-contents:
 *   get:
 *     summary: Get directory contents
 *     description: Retrieves the contents (files and subfolders) of a specified directory.
 *     operationId: getDirectoryContents
 *     tags:
 *       - File Sharing
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the directory to retrieve contents for.
 *     responses:
 *       '200':
 *         description: Directory contents retrieved successfully.
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
 *                     $ref: '#/components/schemas/FileDirectoryEntry'
 *       '400':
 *         description: Bad Request - id is required.
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
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return new NextResponse(
        JSON.stringify({
          message: "id is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    const result = await GetDirectoryContentsAction(id);
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
