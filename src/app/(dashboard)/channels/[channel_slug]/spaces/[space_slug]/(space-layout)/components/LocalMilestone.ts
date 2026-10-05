export interface LocalMilestone {
  id: string // local DnD key — always a fresh UUID
  dbId?: string // original DB milestone id — present for existing milestones during reconfigure
  name: string
  start_date: string
  end_date: string
}
