export const pageMeta = [
  {
    id: "home",
    url: "/",
    title: "Home",
    description: "home/landing page"
  },
  {
    id: "profile",
    url: "/profile",
    title: "Profile",
    description: "user profile containing bio, rewards, activity and schedule"
  },
  {
    id: "events",
    url: "/events",
    title: "Events",
    description: "events"
  },
  {
    id: "chat",
    url: "/chat",
    title: "Chat",
    description: "chat feed"
  },
  {
    id: "posts",
    url: "/posts",
    title: "Posts",
    description: "post feed"
  },
  {
    id: "project-incubator",
    url: "/project-incubator",
    title: "Project Incubator",
    description: "project incubator"
  },
  {
    id: "spaces",
    url: "/spaces",
    title: "Spaces",
    description: "spaces"
  },
  {
    id: "settings",
    url: "/settings",
    title: "Settings",
    description: "user settings"
  },
  {
    id: "general settings",
    url: "/settings/general",
    title: "General",
    description: "general settings"
  },
  {
    id: "team settings",
    url: "/settings/team",
    title: "Team",
    description: "team settings"
  },
  {
    id: "billing settings",
    url: "/settings/billing",
    title: "Billing",
    description: "billing settings"
  },
  {
    id: "limit settings",
    url: "/settings/limit",
    title: "Limit",
    description: "limit settings"
  },
  {
    id: "project",
    url: (channel_slug: string, spaceSlug: string) =>
      `/channels/${channel_slug}/spaces/${spaceSlug}?page-type=project-management`,
    title: "Projects",
    description: "projects"
  },
  {
    id: "channels",
    url: "/channels",
    title: "Channels",
    description: "channels"
  },
  {
    id: "connections",
    url: "/connections",
    title: "Connections",
    description: "connections"
  },
  {
    id: "feedback",
    url: "/feedback",
    title: "Feedback",
    description: "feedback"
  },
  {
    id: "support",
    url: "/support",
    title: "Support",
    description: "support"
  }
]

export const categories = [
  "All",
  "Programming",
  "AI & Machine Learning",
  "Open Source",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "DevOps",
  "Cybersecurity",
  "Blockchain",
  "IoT"
]

export const permissions = {
  posting: {
    create: "create",
    view: "view",
    update: "update",
    delete: "delete"
  },

  chat: {
    create: "create",
    view: "view",
    update: "update",
    delete: "delete"
  },

  events: {
    create: "create",
    view: "view",
    update: "update",
    delete: "delete"
  },

  community: {
    create: "create",
    view: "view",
    update: "update",
    delete: "delete",
    allowAction: "allow.action",
    userInvite: "user.invite",
    userUpdate: "user.update",
    userRemove: "user.remove",
    userView: "user.view",
    channelCreate: "channel.create"
  },

  channel: {
    create: "create",
    view: "view",
    update: "update",
    delete: "delete",
    allowAction: "allow.action",
    spaceCreate: "space.create",
    userView: "user.view",
    userInvite: "user.invite",
    userRemove: "user.remove",
    userUpdate: "user.update"
  },

  space: {
    create: "create",
    view: "view",
    update: "update",
    delete: "delete",
    allowAction: "allow.action",
    projectCreate: "project.create",
    settingUpdate: "setting.update",
    userInvite: "user.invite",
    userView: "user.view",
    userUpdate: "user.update",
    userRemove: "user.remove",
    fileCreate: "file_sharing.create",
    fileView: "file_sharing.view",
    fileUpdate: "file_sharing.update",
    fileDelete: "file_sharing.delete",
    fileAllow: "file_sharing.allow.action",
    postingCreate: "posting.create",
    postingView: "posting.view",
    postingUpdate: "posting.update",
    postingDelete: "posting.delete",
    chatCreate: "chat.create",
    chatView: "chat.view",
    chatUpdate: "chat.update",
    chatDelete: "chat.delete",
    projectView: "project.view"
  },

  project: {
    create: "create",
    view: "view",
    update: "update",
    detail: "detail",
    launchBoard: "launch.board",
    overviewView: "overview.view",
    sprintCreate: "sprint.create",
    sprintUpdate: "sprint.update",
    sprintView: "sprint.view",
    taskCreate: "task.create",
    taskView: "task.view",
    taskUpdate: "task.update",
    taskDelete: "task.delete",
    boardView: "board.view",
    backlogView: "backlog.view",
    backlogTaskView: "backlog.task.view",
    backlogTaskCreate: "backlog.task.create",
    backlogTaskUpdate: "backlog.task.update",
    backlogTaskDelete: "backlog.task.delete",
    filesView: "files.view",
    teamsView: "teams.view",
    teamsAdd: "teams.add",
    teamsUpdate: "teams.update",
    teamsDelete: "teams.delete",
    settingsView: "settings.view"
  }
}

export type PageMeta = (typeof pageMeta)[0]

export enum Sendgrid {
  SENDGRID_TASK_UPDATE_TEMPLATE_ID = "d-d2538f8fe746453c9b264174ed580961"
}

export const EntityUpdateBroadCast = "broadcast-entity-update"
