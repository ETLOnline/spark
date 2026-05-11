import { Button } from "@/src/components/ui/button"
import { InsertShortcut, SelectShortcut } from "@/src/db/schema"
import { Layers2 } from "lucide-react"
import useShortcut from "../hooks/useShortcut"
import { useEffect, useState } from "react"
import { DropdownMenuItem } from "@/src/components/ui/dropdown-menu"

interface CreateShortcutProps {
  type: "space" | "channel" | "community" | "project"
  entity: {
    slug: string
    title: string
    entity_id: string
  }
  ctaType?: "button" | "menuItem"
}

const CreateShortcut = ({
  type,
  entity,
  ctaType = "button"
}: CreateShortcutProps) => {
  const {
    createShortcut,
    loadingShortcuts,
    availableShortcut,
    deleteShortcut,
    shortcutList
  } = useShortcut()
  const [shortcutExist, setShortcutExist] = useState(false)
  const [selectShortcut, setSelectedshortcut] = useState<SelectShortcut | null>(
    null
  )

  const handleCreateShortcut = async () => {
    const newShortcut: Partial<InsertShortcut> = {
      type,
      url: entity.slug,
      title: entity.title,
      community_id: type == "community" ? entity.entity_id : null,
      channel_id: type == "channel" ? entity.entity_id : null,
      space_id: type == "space" ? entity.entity_id : null,
      project_id: type == "project" ? entity.entity_id : null
    }

    await createShortcut(newShortcut)
  }

  const handleDeleteShortcut = async () => {
    if (selectShortcut) {
      await deleteShortcut(selectShortcut.id)
    }
  }

  useEffect(() => {
    if (entity.slug) {
      const shortcutFound = availableShortcut(entity.slug)
      setSelectedshortcut(shortcutFound || null)
      setShortcutExist(shortcutFound ? true : false)
    }
  }, [entity, shortcutList])

  return (
    <>
      {!shortcutExist ? (
        <>
          {ctaType === "button" ? (
            <Button
              variant={"outline"}
              loading={loadingShortcuts}
              onClick={handleCreateShortcut}
              className="w-full min-w-0 text-xs"
            >
              <Layers2 className="shrink-0" />{" "}
              <span className="truncate">Create Shortcut</span>
            </Button>
          ) : (
            <DropdownMenuItem onClick={handleCreateShortcut}>
              <Layers2 className="mr-2 h-4 w-4" /> Create Shortcut
            </DropdownMenuItem>
          )}
        </>
      ) : (
        <>
          {ctaType === "button" ? (
            <Button
              variant={"outline"}
              loading={loadingShortcuts}
              onClick={handleDeleteShortcut}
              className="w-full min-w-0 text-xs"
            >
              <Layers2 className="shrink-0" />{" "}
              <span className="truncate">Delete Shortcut</span>
            </Button>
          ) : (
            <DropdownMenuItem
              onClick={handleDeleteShortcut}
              className="text-red-600 focus:text-red-600"
            >
              <Layers2 className="mr-2 h-4 w-4" /> Delete Shortcut
            </DropdownMenuItem>
          )}
        </>
      )}
    </>
  )
}

export default CreateShortcut
