import { InsertTaskStatus, SelectTaskStatus } from "@/src/db/schema";
import { atom } from "jotai";

const statuses = atom<InsertTaskStatus[]>([])

export const taskStatusesStore = {
  statuses,
}