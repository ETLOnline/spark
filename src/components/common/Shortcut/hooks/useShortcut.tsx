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
    if (res?.success && res.data) {
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
    // ── EDIT channel (already working) ──────────────────────
    const editChannel = pusherClient.subscribe("broadcast-entity-update-sidebar");
    const deleteChannel = pusherClient.subscribe("broadcast-entity-update");

    const handleCommunityEdit = (updated: any) => setShortcutList(prev => prev.map(s => s.community_id === updated.id ? { ...s, community: updated } : s));
    const handleChannelEdit  = (updated: any) => setShortcutList(prev => prev.map(s => s.channel_id  === updated.id ? { ...s, channel:   updated } : s));
    const handleSpaceEdit    = (updated: any) => setShortcutList(prev => prev.map(s => s.space_id    === updated.id ? { ...s, space:     updated } : s));
    const handleProjectEdit  = (updated: any) => setShortcutList(prev => prev.map(s => s.project_id  === updated.id ? { ...s, project:   updated } : s));

    editChannel.bind("community-edit", handleCommunityEdit);
    editChannel.bind("channel-edit",   handleChannelEdit);
    editChannel.bind("space-edit",     handleSpaceEdit);
    editChannel.bind("project-edit",   handleProjectEdit);

    const handleCascadeDelete = async () => {
      const freshData = await getUserShortcuts();
      if (freshData?.success && freshData.data) {
        const updated = generateFullUrl(freshData.data)
        setShortcutList(updated);
      }
    };

    deleteChannel.bind("community-del", handleCascadeDelete);
    deleteChannel.bind("channel-del",   handleCascadeDelete);
    deleteChannel.bind("space-del",     handleCascadeDelete);
    deleteChannel.bind("project-del",   handleCascadeDelete);

    // ── cleanup ─────────────────────────────────────────────
    return () => {
      editChannel.unbind("community-edit", handleCommunityEdit);
      editChannel.unbind("channel-edit",   handleChannelEdit);
      editChannel.unbind("space-edit",     handleSpaceEdit);
      editChannel.unbind("project-edit",   handleProjectEdit);

      deleteChannel.unbind("community-del", handleCascadeDelete);
      deleteChannel.unbind("channel-del",   handleCascadeDelete);
      deleteChannel.unbind("space-del",     handleCascadeDelete);
      deleteChannel.unbind("project-del",   handleCascadeDelete);
    };
  }, [setShortcutList, getUserShortcuts]);

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
        slugToUse = `${s.space.channel.channel_slug}/spaces/${s.space.space_slug}`
        console.log(s.space,"slugToUse")
      } else if (shortcut.type === "project" && s.project?.project_slug) {
        slugToUse = s.project.id
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
          shortcut.url = `/project/${slugToUse}/board`
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