import { InsertShortcut, SelectShortcut } from "@/src/db/schema"
import { useToast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  createShortcutAction,
  deleteShortcutAction,
  getUserShortcutsAction
} from "@/src/server-actions/Shortcut/Shortcut"
import pusherClient from "@/src/services/realtime/PusherClient"
import { userStore } from "@/src/store/user/userStore"
import { EntityUpdateBroadCast } from "@/src/utils/constants"
import { useAtom } from "jotai"
import { useEffect } from "react"

const useShortcut = () => {
  const [shortcutList, setShortcutList] = useAtom(userStore.shortcuts)
  const [loadingShortcuts, , , getUserShortcuts] = useServerAction(
    getUserShortcutsAction
  )
  const [deletingShortcuts, , , deleteShortcutById] =
    useServerAction(deleteShortcutAction)
  const [creatingShortcuts, , , createShortcutAc] =
    useServerAction(createShortcutAction)

  const shortcutMap: Record<string, SelectShortcut[]> = {
    community: [],
    channel: [],
    space: [],
    project: []
  }
  const { toast } = useToast()

  const getShortcuts = async () => {
    const res = await getUserShortcuts()
    if (res?.success) {
      setShortcutList(res.data || [])
      return res.data || []
    } else {
      toast({
        title: "Failed to fetch shortcuts",
        variant: "destructive",
        duration: 2000
      })
      return []
    }
  }

  const deleteShortcut = async (shortcutId: string) => {
    const res = await deleteShortcutById(shortcutId)
    if (res?.success) {
      setShortcutList(shortcutList.filter((s) => s.id !== shortcutId))
      toast({
        title: "Shortcut deleted successfully",
        duration: 2000
      })
    } else {
      toast({
        title: "Failed to fetch shortcuts",
        variant: "destructive",
        duration: 2000
      })
    }
  }

  const createShortcut = async (shortcut: Partial<InsertShortcut>) => {
    const res = await createShortcutAc(shortcut)
    if (res?.success) {
      if (res.data && res.data.id) {
        setShortcutList([...shortcutList, res.data])
        toast({
          title: "Shortcut created successfully",
          duration: 2000
        })
      }
    } else {
      toast({
        title: "Failed to create shortcut",
        variant: "destructive",
        duration: 2000
      })
    }
  }
  useEffect(() => {
    const channelName = "broadcast-entity-update-sidebar";
    const channel = pusherClient.subscribe(channelName);

    // 1. Define specific handlers
    const handleCommunityEdit = (updatedCommunity: any) => {
      setShortcutList((prev) =>
        prev.map((s) =>
          s.entity_id === updatedCommunity.id
            ? { ...s, community: updatedCommunity }
            : s
        )
      )
    };

    const handleChannelEdit = (updatedChannel: any) => {
      setShortcutList((prev) =>
        prev.map((s) =>
          s.entity_id === updatedChannel.id
            ? { ...s, channel: updatedChannel }
            : s
        )
      )
    };
    const handleSpaceEdit = (updatedSpace: any) => {
      setShortcutList((prev) =>
        prev.map((s) =>
          s.entity_id === updatedSpace.id
            ? { ...s, space: updatedSpace }
            : s
        )
      )
    };
    const handleProjectEdit = (updatedProject: any) => {
      setShortcutList((prev) =>
        prev.map((s) =>
          s.entity_id === updatedProject.id
            ? { ...s, project: updatedProject }
            : s
        )
      )
    };

    // 2. Bind specific events
    channel.bind("community-edit", handleCommunityEdit);
    channel.bind("channel-edit", handleChannelEdit);
    channel.bind("space-edit", handleSpaceEdit);
    channel.bind("project-edit", handleProjectEdit);

    return () => {
      // 3. ONLY unbind these specific listeners
      channel.unbind("community-edit", handleCommunityEdit);
      channel.unbind("channel-edit", handleChannelEdit);
      channel.unbind("space-edit", handleSpaceEdit);
      channel.unbind("project-edit", handleProjectEdit);

    };
  }, [setShortcutList]);

  useEffect(() => {
    if (shortcutList && shortcutList.length > 0) {
      const updatedShortcuts = generateFullUrl([...shortcutList])
      const spaceShortcuts = updatedShortcuts.filter(
        (shortcut) => shortcut.type === "space"
      )
      const channelShortcuts = updatedShortcuts.filter(
        (shortcut) => shortcut.type === "channel"
      )
      const communityShortcuts = updatedShortcuts.filter(
        (shortcut) => shortcut.type === "community"
      )
      const projectShortcuts = updatedShortcuts.filter(
        (shortcut) => shortcut.type === "project"
      )
      shortcutMap.channel = channelShortcuts
      shortcutMap.space = spaceShortcuts
      shortcutMap.community = communityShortcuts
      shortcutMap.project = projectShortcuts
    }
  }, [shortcutList])

  const generateFullUrl = (list: any[]) => { 
    const updatedShortcuts = list.map((s) => {
      const shortcut = { ...s }

      if (shortcut.type === "community" && s.community) {
        shortcut.title = s.community.title
      } else if (shortcut.type === "channel" && s.channel) {
        shortcut.title = s.channel.channel_name
      } else if (shortcut.type === "space" && s.space) {
        shortcut.title = s.space.space_name
      } else if (shortcut.type === "project" && s.project) {
        shortcut.title = s.project.project_name
      }

    
      let slugToUse = shortcut.url

      if (shortcut.type === "community" && s.community?.slug) {
        slugToUse = s.community.slug
      } else if (shortcut.type === "channel" && s.channel?.channel_slug) {
        slugToUse = s.channel.channel_slug
      } else if (shortcut.type === "space" && s.space?.space_slug) {
        slugToUse = s.space.space_slug
      } else if (shortcut.type === "project" && s.project?.project_slug) {
        slugToUse = s.project.project_slug
      }

      const encodedUrl = encodeURIComponent(slugToUse)
      switch (shortcut.type) {
        case "space":
          shortcut.url = `/channels/${slugToUse}`
          break
        case "channel":
          shortcut.url = `/channels/${encodedUrl}/spaces`
          break
        case "community":
          shortcut.url = `/communities/${encodedUrl}`
          break
        case "project":
          shortcut.url = `/project/${encodedUrl}/board`
          break
        default:
          break
      }
      return shortcut
    })
    return updatedShortcuts
  }

  const availableShortcut = (shortcutUrl: string) => {
    return shortcutList.find((shortcut) => shortcut.url === shortcutUrl)
  }

  return {
    shortcutList,
    getShortcuts,
    deleteShortcut,
    createShortcut,
    loadingShortcuts:
      loadingShortcuts || creatingShortcuts || deletingShortcuts,
    shortcutMap,
    availableShortcut
  }
}

export default useShortcut
