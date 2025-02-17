import { SelectEvent } from "@/src/db/schema";
import { atom } from "jotai";

const selectedEvent = atom<SelectEvent | null>(null)
const formModalVisibility = atom(false)

export const eventStore = {
  selectedEvent,
  formModalVisibility
}