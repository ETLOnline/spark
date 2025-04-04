import { SelectChannel, SelectSpace } from "@/src/db/schema"
import { GanttChart, Hash } from "lucide-react"

export const getSpaceNavMapped = (spaces: SelectSpace[], channel: SelectChannel) => {
  return spaces.map((s) => ({
    title: s.space_name,
    url: `/channels/${channel.channel_slug}/spaces/${s.space_slug}`,
    icon: GanttChart,
  }))
}

export const getChannelsNavMapped = (channels: SelectChannel[]) => {
return channels.map((c) => ({
  title: c.channel_name,
  url: `/channels/${c.channel_slug}/spaces`,
  icon: Hash,
  items: c?.spaces && c.spaces.length
    ? getSpaceNavMapped(c.spaces, c)
    : [],
  isPrivate: c.channel_type === "private",
}))
}