"use server"

import { InsertProjectComment } from "../../../db/schema";
import { CreateServerAction } from "../../";
import { CreateProjectComment, DeleteProjectComment } from "../../../db/data-access/project-management/comments/query";

export const CreateProjectCommentAction = CreateServerAction(
  true,
  async (comment_data: InsertProjectComment) => {
    try {
      const newComment = await CreateProjectComment(comment_data);
      return { success: true, data: newComment };
    } catch (error) {
      return { error };
    }
  }
);

export const DeleteProjectCommentAction = CreateServerAction(
  true,
  async (commentId: string) => {
    try {
      const deletedComment = await DeleteProjectComment(commentId);
      return { success: true, data: deletedComment };
    } catch (error) {
      return { error };
    }
  }
);