

import { ShortcutEntityType } from "./cleanup.types";
import {
  communityExists,
  channelExists,
  spaceExists,
  projectExists,
} from "@/src/db/data-access/shortcuts/cleanup.query";


export type EntityChecker = (entityId: string) => Promise<boolean>;

export const ENTITY_CHECKERS: Record<ShortcutEntityType, EntityChecker> = {
  community: communityExists,
  channel:   channelExists,
  space:     spaceExists,
  project:   projectExists,
};