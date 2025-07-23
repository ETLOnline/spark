
import { CreateTaskStatusAction, GetTaskStatusAction } from "@/src/server-actions/Tasks/Task";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /task/status:
 *   post:
 *     summary: Create a new task status
 *     description: Creates a new task status for a project.
 *     operationId: createTaskStatus
 *     tags:
 *       - Tasks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InsertTaskStatus'
 *     responses:
 *       '200':
 *         description: Task status created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TaskStatus'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   get:
 *     summary: Get task statuses by project ID
 *     description: Retrieves a list of task statuses for a given project.
 *     operationId: getTaskStatuses
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the project to retrieve task statuses for.
 *     responses:
 *       '200':
 *         description: Task statuses retrieved successfully.
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
 *                     $ref: '#/components/schemas/TaskStatus'
 *       '400':
 *         description: Bad Request - projectId is required.
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
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await CreateTaskStatusAction(data);
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
    const projectId = searchParams.get("projectId");
    if (!projectId) {
      return new NextResponse(
        JSON.stringify({
          message: "projectId is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    const result = await GetTaskStatusAction(projectId);
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

