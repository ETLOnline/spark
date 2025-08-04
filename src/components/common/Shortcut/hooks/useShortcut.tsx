import { InsertShortcut, SelectShortcut } from "@/src/db/schema"
import { useToast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  createShortcutAction,
  deleteShortcutAction,
  getUserShortcutsAction
} from "@/src/server-actions/Shortcut/Shortcut"
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

  const generateFullUrl = (list: SelectShortcut[]) => {
    const updatedShortcuts = list.map((s) => {
      const shortcut = { ...s }
      const encodedUrl = encodeURIComponent(shortcut.url)
      switch (shortcut.type) {
        case "space":
          shortcut.url = `/channels/${encodedUrl}`
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
