import { eq } from "drizzle-orm"
import {
  channelsTable,
  communitiesTable,
  projectTable,
  spacesTable
} from "../../schema"
import { db } from "../.."

export async function getHierarchy(type: string, id: string) {
  try {
    if (type === "project") {
      const project = await db.query.projectTable.findFirst({
        where: eq(projectTable.id, id),
        columns: {
          id: true
        },
        with: {
          space: {
            columns: {
              id: true
            },
            with: {
              channel: {
                columns: {
                  id: true
                },
                with: {
                  community: {
                    columns: {
                      id: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      return project
    }

    if (type === "space") {
      const space = await db.query.spacesTable.findFirst({
        where: eq(spacesTable.space_slug, id),
        columns: {
          id: true
        },
        with: {
          channel: {
            columns: {
              id: true
            },
            with: {
              community: {
                columns: {
                  id: true
                }
              }
            }
          }
        }
      })

      return space
    }

    if (type === "channel") {
      const channel = await db.query.channelsTable.findFirst({
        where: eq(channelsTable.channel_slug, id),
        columns: {
          id: true
        },
        with: {
          community: {
            columns: {
              id: true
            }
          }
        }
      })

      return channel
    }

    if (type === "community") {
      const community = await db.query.communitiesTable.findFirst({
        where: eq(communitiesTable.slug, id),
        columns: {
          id: true
        }
      })

      return community
    }
  } catch (error) {
    console.error("Error in getHierarchy:", error)
    throw error
  }
}
