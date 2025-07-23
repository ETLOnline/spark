import { CreateNewFolderAction } from "@/src/server-actions/FileSharing/FileSharing";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /file-sharing/folder:
 *   post:
 *     summary: Create a new folder
 *     description: Creates a new folder within a specified parent directory.
 *     operationId: createNewFolder
 *     tags:
 *       - File Sharing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the parent directory.
 *                 example: "parent_dir_123"
 *               folderName:
 *                 type: string
 *                 description: The name of the new folder.
 *                 example: "My New Folder"
 *             required:
 *               - id
 *               - folderName
 *     responses:
 *       '200':
 *         description: Folder created successfully.
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
export async function POST(req: Request) {
  try {
    const { id, folderName } = await req.json();
    const result = await CreateNewFolderAction(id, folderName);
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