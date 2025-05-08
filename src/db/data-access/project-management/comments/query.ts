import { eq, sql } from "drizzle-orm";
import { db } from "../../..";
import { InsertProjectComment, projectCommentsTable, SelectProjectComment } from "../../../schema";

export async function CreateProjectComment(comment_data: InsertProjectComment) {
    try {
        const comment = await db.insert(projectCommentsTable).values(comment_data).returning();
        return comment[0];
    } catch (e: any) {
        throw new Error(e.message);
    }
}

export async function DeleteProjectComment(commentId: string) {
    try {
        const comment = await db
            .update(projectCommentsTable)
            .set({ deleted_at: sql`CURRENT_TIMESTAMP` })
            .where(eq(projectCommentsTable.id, commentId))
            .returning();
        return comment[0];
    } catch (e: any) {
        throw new Error(e.message);
    }
}