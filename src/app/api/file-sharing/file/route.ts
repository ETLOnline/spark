
import { CreateNewFileAction } from "@/src/server-actions/FileSharing/FileSharing";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /file-sharing/file:
 *   post:
 *     summary: Create a new file
 *     description: Creates a new file within a specified parent directory and uploads its content.
 *     operationId: createNewFile
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
 *               fileName:
 *                 type: string
 *                 description: The name of the new file.
 *                 example: "document.pdf"
 *               fileSize:
 *                 type: number
 *                 description: The size of the file in bytes.
 *                 example: 1024
 *               fileB64string:
 *                 type: string
 *                 description: Base64 encoded content of the file.
 *                 example: "JVBERi0xLjQKJcOkw7zDtsO3CjIgMCBvYmoKPD..."
 *               fileType:
 *                 type: string
 *                 description: The MIME type of the file.
 *                 example: "application/pdf"
 *               folderPath:
 *                 type: string
 *                 description: The path to the folder where the file will be stored.
 *                 example: "uploads/documents"
 *             required:
 *               - id
 *               - fileName
 *               - fileSize
 *               - fileB64string
 *               - fileType
 *               - folderPath
 *     responses:
 *       '200':
 *         description: File created and uploaded successfully.
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
    const { id, fileName, fileSize, fileB64string, fileType, folderPath } = await req.json();
    const result = await CreateNewFileAction(id, fileName, fileSize, fileB64string, fileType, folderPath);
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
