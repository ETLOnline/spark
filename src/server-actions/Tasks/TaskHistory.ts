import { InsertTask, InsertTaskComment, SelectTask } from "@/src/db/schema"
import { CreateServerAction } from ".."
import { TaskHistory } from "@/src/components/Dashboard/ProjectManagement/constants/projectManagment"
import { AuthUserAction } from "../User/AuthUserAction"
import { createTaskComment } from "@/src/db/data-access/tasks/query"

export const AddTaskHistoryAction = CreateServerAction(
  true,
  async (oldTask: SelectTask, newTask: SelectTask) => {
    try {
      const authUser = await AuthUserAction()

      const history = TaskHistory(oldTask, newTask)

      const payload: InsertTaskComment = {
        task_id: newTask.id,
        user_id: authUser.unique_id,
        type: "history",
        task_history: history,
        content: ""
      }

      const comment = await createTaskComment(payload)

      return { success: true, data: comment }
    } catch (error) {
      return { success: false, error: error }
    }
  }
)
