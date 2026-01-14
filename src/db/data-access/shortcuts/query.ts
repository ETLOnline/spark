import { and, eq, inArray, like } from "drizzle-orm"
import { db } from "../.."
import {
  channelsTable,
  communitiesTable,
  InsertShortcut,
  projectTable,
  shortcutsTable,
  spacesTable
} from "../../schema"
import { GetCommunityById, GetCommunityBySlug } from "../communities/query"
import { GetChannelBySlug } from "../channels/query"
import { GetSpaceBySlug } from "../spaces/query"
import { slugify } from "@/src/utils/helpers"

export const AddShortcut = async (data: InsertShortcut) => {
  try {
    return (await db.insert(shortcutsTable).values(data).returning()).at(0)
  } catch (e: any) {
    throw new Error("Failed to add shortcut", {
      cause: e
    })
  }
}

export const DeleteShortcut = async (shortcutId: string) => {
  try {
    return await db
      .delete(shortcutsTable)
      .where(eq(shortcutsTable.id, shortcutId))
  } catch (e: any) {
    throw new Error("Failed to delete shortcut", {
      cause: e
    })
  }
}

export const GetUserShortcuts = async (userId: string) => {
  try {
    return await db
      .select()
      .from(shortcutsTable)
      .where(eq(shortcutsTable.user_id, userId))
  } catch (e: any) {
    throw new Error("Failed to get shortcuts", {
      cause: e
    })
  }
}


export const DeleteShortcutsCascade = async (
  userId: string,
  entityType: "community" | "channel" | "space" | "project",
  entitySlug: string
) => {
  try {
    const urlsToDelete: string[] = []

    switch (entityType) {
      case "community": {
        const community = await GetCommunityBySlug(entitySlug)
        if (!community) break

        const channels = await db
          .select({
            id: channelsTable.id,
            slug: channelsTable.channel_slug
          })
          .from(channelsTable)
          .where(eq(channelsTable.community_id, community.id))

        const channelSlugs = channels.map((ch) => ch.slug)

        let spaceSlugs: string[] = []
        if (channels.length > 0) {
          const spaces = await db
            .select({
              id: spacesTable.id,
              slug: spacesTable.space_slug,
              channelId: spacesTable.channel_id
            })
            .from(spacesTable)
            .where(
              inArray(
                spacesTable.channel_id,
                channels.map((ch) => ch.id)
              )
            )

          spaceSlugs = spaces
            .map((sp) => {
              const channel = channels.find((ch) => ch.id === sp.channelId)
              return channel ? `${channel.slug}/spaces/${sp.slug}` : ""
            })
            .filter(Boolean)
        }

        let projectSlugs: string[] = []
        if (spaceSlugs.length > 0) {
          const spaceIds = await db
            .select({ id: spacesTable.id })
            .from(spacesTable)
            .where(
              inArray(
                spacesTable.channel_id,
                channels.map((ch) => ch.id)
              )
            )

          if (spaceIds.length > 0) {
            const projects = await db
              .select({ id: projectTable.id })
              .from(projectTable)
              .where(
                inArray(
                  projectTable.space_id,
                  spaceIds.map((sp) => sp.id)
                )
              )

            projectSlugs = projects.map((proj) => proj.id)
          }
        }

        urlsToDelete.push(
          entitySlug, 
          ...channelSlugs, 
          ...spaceSlugs, 
          ...projectSlugs 
        )
        break
      }

      case "channel": {
        const channel = await GetChannelBySlug(entitySlug)
        if (!channel) break

        const spaces = await db
          .select({
            slug: spacesTable.space_slug
          })
          .from(spacesTable)
          .where(eq(spacesTable.channel_id, channel.id))

        const spaceSlugs = spaces.map((sp) => `${entitySlug}/spaces/${sp.slug}`)
        const spaceIds = await db
          .select({ id: spacesTable.id })
          .from(spacesTable)
          .where(eq(spacesTable.channel_id, channel.id))

        let projectSlugs: string[] = []
        if (spaceIds.length > 0) {
          const projects = await db
            .select({ id: projectTable.id })
            .from(projectTable)
            .where(
              inArray(
                projectTable.space_id,
                spaceIds.map((sp) => sp.id)
              )
            )

          projectSlugs = projects.map((proj) => proj.id)
        }

        urlsToDelete.push(
          entitySlug,
          ...spaceSlugs,
          ...projectSlugs
        )
        break
      }

      case "space": {
        const channel_slug = entitySlug.split("/").filter(Boolean).shift()
        const spaceSlug = entitySlug.split("/").filter(Boolean).pop()

        if (!channel_slug || !spaceSlug) break

        const space = await GetSpaceBySlug(spaceSlug, channel_slug)
        if (!space) break

        const projects = await db
          .select({ id: projectTable.id })
          .from(projectTable)
          .where(eq(projectTable.space_id, space.id))

        const projectSlugs = projects.map((proj) => proj.id)

        urlsToDelete.push(
          entitySlug,
          ...projectSlugs
        )
        break
      }

      case "project": {
        urlsToDelete.push(entitySlug)
        break
      }

      default:
        throw new Error(`Invalid entity type: ${entityType}`)
    }

    if (urlsToDelete.length > 0) {
      await db
        .delete(shortcutsTable)
        .where(
          and(
            eq(shortcutsTable.user_id, userId),
            inArray(shortcutsTable.url, urlsToDelete)
          )
        )
    }

    return {
      success: true,
      message: "Shortcuts deleted successfully",
      deletedCount: urlsToDelete.length
    }
  } catch (e: any) {
    throw new Error("Failed to cascade delete shortcuts", {
      cause: e
    })
  }
}

export const DeleteShortcutsByUrl = async (
  userId: string,
  type: "community" | "channel" | "space" | "project",
  urlPattern: string
) => {
  try {
    return await DeleteShortcutsCascade(userId, type, urlPattern)
  } catch (e: any) {
    throw new Error("Failed to delete shortcuts by URL", {
      cause: e
    })
  }
}

export const UpdateShortcutTitle = async (
  shortcutId: string,
  type: "community" | "channel" | "space" | "project",
  newTitle: string
) => {
  
  try {
    const newUrlSlug = slugify(newTitle);
    
    if (type === "project") {
      const result = await db
        .update(shortcutsTable)
        .set({ title: newTitle })
        .where(eq(shortcutsTable.entity_id, shortcutId))
        .returning();
      return result[0] || null;
    }

    const currentShortcut = await db
      .select()
      .from(shortcutsTable)
      .where(eq(shortcutsTable.entity_id, shortcutId))
      .limit(1);
    
    if (!currentShortcut?.length) throw new Error("Shortcut not found");
    
    let newUrl = '';
    if (type === "community" || type === "channel") {
      newUrl = newUrlSlug;
    } else if (type === "space") {
      const urlParts = currentShortcut[0].url.split('/');
      if (urlParts.length >= 3) {
        newUrl = `${urlParts[0]}/spaces/${newUrlSlug}`;
      } else {
        throw new Error("Invalid space URL format");
      }
    }

    const result = await db
      .update(shortcutsTable)
      .set({ title: newTitle, url: newUrl })
      .where(eq(shortcutsTable.entity_id, shortcutId))
      .returning();

    switch (type) {
      case "community": {
        await db.update(communitiesTable)
          .set({ slug: newUrlSlug })
          .where(eq(communitiesTable.id, shortcutId));
        
        const channels = await db.select().from(channelsTable)
          .where(eq(channelsTable.community_id, shortcutId));
        
        for (const channel of channels) {
          const freshChannelSlugPart = slugify(channel.channel_name);
          const newChannelSlug = `${newUrlSlug}-${freshChannelSlugPart}`;
          
          await db.update(channelsTable)
            .set({ channel_slug: newChannelSlug })
            .where(eq(channelsTable.id, channel.id));
          
          await db.update(shortcutsTable)
            .set({ url: newChannelSlug })
            .where(eq(shortcutsTable.entity_id, channel.id));

          const spaces = await db.select().from(spacesTable)
            .where(eq(spacesTable.channel_id, channel.id));
          
          for (const space of spaces) {
            const freshSpaceSlugPart = slugify(space.space_name);
            const newSpaceUrl = `${newChannelSlug}/spaces/${freshSpaceSlugPart}`;
            
            await db.update(shortcutsTable)
              .set({ url: newSpaceUrl })
              .where(eq(shortcutsTable.entity_id, space.id));
            
            await db.update(spacesTable)
              .set({ space_slug: freshSpaceSlugPart })
              .where(eq(spacesTable.id, space.id));
          }
        }
        break;
      }
      
      case "channel": {
        await db.update(channelsTable)
          .set({ channel_slug: newUrlSlug })
          .where(eq(channelsTable.id, shortcutId));
        
        const spaces = await db.select().from(spacesTable)
          .where(eq(spacesTable.channel_id, shortcutId));
        
        for (const space of spaces) {
          const freshSpaceSlugPart = slugify(space.space_name);
          const newSpaceUrl = `${newUrlSlug}/spaces/${freshSpaceSlugPart}`;
          
          await db.update(shortcutsTable)
            .set({ url: newSpaceUrl })
            .where(eq(shortcutsTable.entity_id, space.id));
        }
        break;
      }

      case "space": {
        await db.update(spacesTable)
          .set({ space_slug: newUrlSlug })
          .where(eq(spacesTable.id, shortcutId));
        break;
      }
    }
    
    return result[0] || null;
  } catch (e: any) {
    throw new Error("Failed to update shortcut title", { cause: e });
  }
};