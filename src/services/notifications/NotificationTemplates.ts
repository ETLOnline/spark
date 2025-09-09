export type Template = {
  title: string
  body: string
  deep_link: string
  icon?: string
}

type TemplateParams = {
  sender?: string
  senderIcon?: string
  entityName?: string
  entityId?: string
  projectName?: string
  ctaLink?: string
}

export const NotificationTemplates = {
  connectionRequest: ({ sender, senderIcon }: TemplateParams): Template => ({
    title: "New Connection Request",
    body: `${sender} has sent you a connection request.`,
    deep_link: `${process.env.NEXT_PUBLIC_APP_URL}/connections`,
    icon: senderIcon
  }),

  connectionAccepted: ({ sender, senderIcon }: TemplateParams): Template => ({
    title: "Connection Accepted",
    body: `${sender} has accepted your connection request. You’re now connected.`,
    deep_link: `${process.env.NEXT_PUBLIC_APP_URL}/connections`,
    icon: senderIcon
  }),

  projectMemberAdded: ({ entityId }: TemplateParams): Template => ({
    title: "Added to Project",
    body: `You have been added to the new project.`,
    deep_link: `${process.env.NEXT_PUBLIC_APP_URL}/project/${entityId}/board`
  }),

  taskAssigned: ({
    entityName,
    projectName,
    ctaLink
  }: TemplateParams): Template => ({
    title: `New Task Assigned: ${entityName}`,
    body: `You have been assigned a new task in project "${projectName}".`,
    deep_link: `${process.env.NEXT_PUBLIC_APP_URL}/${ctaLink}`
  }),

  taskUpdated: ({ sender, entityName, ctaLink }: TemplateParams): Template => ({
    title: `Task Updated`,
    body: `${sender} updated the task ${entityName}.`,
    deep_link: `${process.env.NEXT_PUBLIC_APP_URL}/${ctaLink}`
  }),

  taskComment: ({
    sender,
    senderIcon,
    entityName,
    ctaLink
  }: TemplateParams): Template => ({
    title: `New Comment on Task: ${entityName}`,
    body: `${sender} commented on the task "${entityName}".`,
    deep_link: `${process.env.NEXT_PUBLIC_APP_URL}/${ctaLink}`,
    icon: senderIcon
  }),

  chatStarted: ({ sender, senderIcon, ctaLink }: TemplateParams): Template => ({
    title: "New Chat Created",
    body: `${sender} has started a new chat with you.`,
    deep_link: `${process.env.NEXT_PUBLIC_APP_URL}/${ctaLink}`,
    icon: senderIcon
  }),

  groupChatAdded: ({ entityName, ctaLink }: TemplateParams): Template => ({
    title: `New Group Chat: ${entityName}`,
    body: `You have been added to a new group chat.`,
    deep_link: `${process.env.NEXT_PUBLIC_APP_URL}/${ctaLink}`
  })
}
