// static permissions
export const PERMISSIONS = {
  space: [
    "create",
    "delete",
    "view",
    "update",
    "setting.update",
    "user.invite",
    "user.update",
    "user.remove",
    "user.view"
  ],
  project: ["create", "update", "view"],
  posting: ["create_file", "delete", "edit"],
  chat: ["create", "view", "delete", "update"],
  events: ["create", "edit", "delete", "view"],
  channels: [
    "create",
    "edit",
    "delete",
    "view",
    "user.invite",
    "user.update",
    "user.remove",
    "user.view"
  ]
}
