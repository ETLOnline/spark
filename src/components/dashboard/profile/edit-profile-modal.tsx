import { useRef, useState } from "react"
import { Button } from "../../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"

type SetProfileStringValue = (value: string) => void
type SetProfileStringArrayValue = (value: string[]) => void

type EditProfileModalProps = {
  variant: "bio" | "interests" | "skills"
  profileValue: string
  setProfileValue: SetProfileStringValue | SetProfileStringArrayValue
}

const EditProfileModal: React.FC<EditProfileModalProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false)
  const editedProfileValue = useRef<string>("")

  const updateProfileValue = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (props.variant === "bio") {
      ;(props.setProfileValue as SetProfileStringValue)(
        editedProfileValue.current
      )
    } else {
      ;(props.setProfileValue as SetProfileStringArrayValue)([
        ...editedProfileValue.current.split(","),
      ])
    }
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="edit" size={"sm"} onClick={() => setIsOpen(true)}>
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {props.variant}
            </Label>
            <Input
              id={props.variant}
              defaultValue={props.profileValue}
              className="w-full"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                (editedProfileValue.current = e.target.value)
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={updateProfileValue}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditProfileModal
