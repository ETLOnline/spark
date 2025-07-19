import { Button } from "@/src/components/ui/button"
import { InsertShortcut, SelectShortcut } from "@/src/db/schema"
import { Layers2 } from "lucide-react"
import useShortcut from "../hooks/useShortcut"
import { useEffect, useState } from "react"

interface CreateShortcutProps {
  type: 'space'| 'channel'| 'community'| 'project'
  entity: {
    slug: string,
    title: string
  }
  ctaType?: 'button' | 'menuItem'
}

const CreateShortcut = ({ type, entity,ctaType = 'button' }: CreateShortcutProps) => {

  const {createShortcut, loadingShortcuts, availableShortcut, deleteShortcut, shortcutList} = useShortcut()
  const [shortcutExist, setShortcutExist] = useState(false)
  const [selectShortcut , setSelectedshortcut]= useState<SelectShortcut | null>(null)


  const handleCreateShortcut = async() => {
    
    const newShortcut :Partial<InsertShortcut> = {
      type,
      url: entity.slug,
      title: entity.title
    }

    await createShortcut(newShortcut)
  }

  const handleDeleteShortcut = async()=>{
    if(selectShortcut){
      await deleteShortcut(selectShortcut.id)
    }
  }

  useEffect(()=>{
    if(entity.slug){
      const shortcutFound = availableShortcut(entity.slug)
      setSelectedshortcut(shortcutFound || null)
      setShortcutExist(shortcutFound ? true : false)
    }
  },[entity, shortcutList])


  return (
    <>
    {
      !shortcutExist ? (
        <>
          {
            ctaType === 'button' ? (
              <Button variant={'outline'} loading={loadingShortcuts} onClick={handleCreateShortcut}> <Layers2 /> Create Shortcut</Button>
            ):null
          }
        </>
      ):(
        <Button variant={'outline'} loading={loadingShortcuts} onClick={handleDeleteShortcut}> <Layers2 /> Delete Shortcut</Button>
      )
    }
    </>
  )
}

export default CreateShortcut