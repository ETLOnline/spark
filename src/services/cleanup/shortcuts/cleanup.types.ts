export type ShortcutEntityType = "community" | "channel" | "space" | "project";
export type ParentLevel = "community" | "channel" | "space";

export interface RawShortcut {
  id: string;
  type: ShortcutEntityType;
  entity_id: string;
}

export interface CleanupReport {
  startedAt: string;
  finishedAt: string;
  totalChecked: number;
  totalDeleted: number;
  errors: string[];
}