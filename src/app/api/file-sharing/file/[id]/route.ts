
import { DeleteFileAction } from "@/src/server-actions/FileSharing/FileSharing";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /file-sharing/file/{id}:
 *   delete:
 *     summary: Delete a file
 *     description: Deletes a file record and its associated file from storage.
 *     operationId: deleteFile
 *     tags:
 *       - File Sharing
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the file directory entry to delete.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               spaceId:
 *                 type: string
 *                 description: The ID of the space the file belongs to.
 *                 example: "space_abc"
 *             required:
 *               - spaceId
 *     responses:
 *       '200':
 *         description: File deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FileDirectoryEntry'
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
    const { spaceId } = await req.json();
    const result = await DeleteFileAction(Number(resolvedParams.id), spaceId, false);
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
