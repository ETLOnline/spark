import { z } from "zod"
import moment from "moment"

export const projectSchema = z
  .object({
    project_name: z
      .string()
      .min(1, "Title required")
      .max(50, "Title is too long"),
    project_startDate: z.string().min(1, "Start date required"),
    project_targetDate: z.string().min(1, "Target date required"),
    description: z
      .string()
      .min(1, "Description required")
      .max(1000, "Description is too long"),
    project_type: z.boolean().optional()
  })
  .refine(
    (data) => {
      if (!data.project_startDate || !data.project_targetDate) return true
      return moment(data.project_targetDate, "YYYY-MM-DD").isSameOrAfter(
        moment(data.project_startDate, "YYYY-MM-DD")
      )
    },
    {
      message: "Target date must be after or equal to start date",
      path: ["project_targetDate"]
    }
  )
