import { sql } from "drizzle-orm"
import { db } from "../index"
import { permissionsTable } from "../schema"
import { permissions } from "@/src/utils/constants"

const permissionSeedList = [
  // Posting
  { namespace: "posting", action: permissions.posting.create },
  { namespace: "posting", action: permissions.posting.view },
  { namespace: "posting", action: permissions.posting.update },
  { namespace: "posting", action: permissions.posting.delete },

  // Chat
  { namespace: "chat", action: permissions.chat.create },
  { namespace: "chat", action: permissions.chat.view },
  { namespace: "chat", action: permissions.chat.delete },
  { namespace: "chat", action: permissions.chat.update },

  // Events
  { namespace: "events", action: permissions.events.create },
  { namespace: "events", action: permissions.events.update },
  { namespace: "events", action: permissions.events.delete },
  { namespace: "events", action: permissions.events.view },

  // Community
  { namespace: "community", action: permissions.community.create },
  { namespace: "community", action: permissions.community.view },
  { namespace: "community", action: permissions.community.update },
  { namespace: "community", action: permissions.community.delete },
  { namespace: "community", action: permissions.community.allowAction },
  { namespace: "community", action: permissions.community.userInvite },
  { namespace: "community", action: permissions.community.userEmailInvite },
  { namespace: "community", action: permissions.community.userUpdate },
  { namespace: "community", action: permissions.community.userRemove },
  { namespace: "community", action: permissions.community.userView },
  { namespace: "community", action: permissions.community.channelCreate },

  // Channel
  { namespace: "channel", action: permissions.channel.create },
  { namespace: "channel", action: permissions.channel.update },
  { namespace: "channel", action: permissions.channel.delete },
  { namespace: "channel", action: permissions.channel.view },
  { namespace: "channel", action: permissions.channel.allowAction },
  { namespace: "channel", action: permissions.channel.spaceCreate },

  // Channel Users
  { namespace: "channel", action: permissions.channel.userView },
  { namespace: "channel", action: permissions.channel.userInvite },
  { namespace: "channel", action: permissions.channel.userRemove },
  { namespace: "channel", action: permissions.channel.userUpdate },

  // Space
  { namespace: "space", action: permissions.space.create },
  { namespace: "space", action: permissions.space.view },
  { namespace: "space", action: permissions.space.update },
  { namespace: "space", action: permissions.space.delete },
  { namespace: "space", action: permissions.space.allowAction },
  { namespace: "space", action: permissions.space.projectCreate },

  // Space Settings
  { namespace: "space", action: permissions.space.settingUpdate },

  // Space Users
  { namespace: "space", action: permissions.space.userInvite },
  { namespace: "space", action: permissions.space.userView },
  { namespace: "space", action: permissions.space.userUpdate },
  { namespace: "space", action: permissions.space.userRemove },

  // Space File Sharing
  { namespace: "space", action: permissions.space.fileCreate },
  { namespace: "space", action: permissions.space.fileView },
  { namespace: "space", action: permissions.space.fileUpdate },
  { namespace: "space", action: permissions.space.fileDelete },
  { namespace: "space", action: permissions.space.fileAllow },

  // Space Posting
  { namespace: "space", action: permissions.space.postingCreate },
  { namespace: "space", action: permissions.space.postingView },
  { namespace: "space", action: permissions.space.postingUpdate },
  { namespace: "space", action: permissions.space.postingDelete },

  // Space Chat
  { namespace: "space", action: permissions.space.chatCreate },
  { namespace: "space", action: permissions.space.chatView },
  { namespace: "space", action: permissions.space.chatDelete },
  { namespace: "space", action: permissions.space.chatUpdate },
  { namespace: "space", action: permissions.space.projectView },

  // Project
  { namespace: "project", action: permissions.project.create },
  { namespace: "project", action: permissions.project.view },
  { namespace: "project", action: permissions.project.update },

  { namespace: "project", action: permissions.project.detail },
  { namespace: "project", action: permissions.project.launchBoard },

  { namespace: "project", action: permissions.project.overviewView },

  { namespace: "project", action: permissions.project.sprintCreate },
  { namespace: "project", action: permissions.project.sprintUpdate },
  { namespace: "project", action: permissions.project.sprintView },

  { namespace: "project", action: permissions.project.taskCreate },
  { namespace: "project", action: permissions.project.taskView },
  { namespace: "project", action: permissions.project.taskUpdate },
  { namespace: "project", action: permissions.project.taskDelete },

  { namespace: "project", action: permissions.project.boardView },

  { namespace: "project", action: permissions.project.backlogView },
  { namespace: "project", action: permissions.project.backlogTaskView },
  { namespace: "project", action: permissions.project.backlogTaskCreate },
  { namespace: "project", action: permissions.project.backlogTaskUpdate },
  { namespace: "project", action: permissions.project.backlogTaskDelete },

  { namespace: "project", action: permissions.project.filesView },

  { namespace: "project", action: permissions.project.teamsView },
  { namespace: "project", action: permissions.project.teamsAdd },
  { namespace: "project", action: permissions.project.teamsUpdate },
  { namespace: "project", action: permissions.project.teamsDelete },

  { namespace: "project", action: permissions.project.settingsView },

  { namespace: "project", action: permissions.project.DetailView },
  { namespace: "project", action: permissions.project.ChatView },

  // Mentorship
  { namespace: "mentorship", action: permissions.mentorship.sessionRequest },
  { namespace: "mentorship", action: permissions.mentorship.addAvailability },

  // FYP
  { namespace: "fyp", action: permissions.fyp.canRequestAdvisor },
  { namespace: "fyp", action: permissions.fyp.canReceiveAdvisorRequest },
  { namespace: "fyp", action: permissions.fyp.advisorViewRequests },
  { namespace: "fyp", action: permissions.fyp.advisorViewDetails },
  { namespace: "fyp", action: permissions.fyp.advisorAccept },
  { namespace: "fyp", action: permissions.fyp.advisorReject }
]

export const PermissionsSeed = async () => {
  return await db.transaction(async (tx) => {
    try {
      await tx.delete(permissionsTable)

      await tx.execute(sql`ALTER SEQUENCE permissions_id_seq RESTART WITH 1;`)

      const res = await tx.insert(permissionsTable).values(permissionSeedList)

      if (res.count === permissionSeedList.length) {
        console.log(`✅ Seeded ${res.count} permissions successfully.`)
      } else {
        console.warn(
          `⚠️ Expected to insert ${permissionSeedList.length} but got ${res.count}`
        )
      }
    } catch (error) {
      console.error("❌ Error seeding permissions:", error)
      tx.rollback()
      process.exit(1)
    }
  })
}
