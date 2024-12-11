import { useRef, useState } from "react"
import { Button } from "../../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../../ui/dialog"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import ChipsInput from "@/src/components/chips-input"

type EditProfileModalProps = {
  bio: string
  setBio: (value: string) => void
  interests: string[]
  setInterests: (value: string[]) => void
  skills: string[]
  setSkills: (value: string[]) => void
}

const EditProfileModal: React.FC<EditProfileModalProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [skillsCopy, setSkillsCopy] = useState<string[]>([...props.skills])
  const [interestsCopy, setinterestsCopy] = useState<string[]>([
    ...props.interests
  ])
  const editedBio = useRef<string>(props.bio)

  const updateProfileValue = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    editedBio.current.length && props.setBio(editedBio.current)
    skillsCopy.length && props.setSkills([...skillsCopy])
    interestsCopy.length && props.setInterests([...interestsCopy])
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
        <form onSubmit={updateProfileValue} className="edit-profile-form">
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-y-7">
              <div className="edit-bio w-full">
                <Label htmlFor="bio" className="edit-label">
                  Bio
                </Label>
                <Textarea
                  id={"bio"}
                  defaultValue={props.bio}
                  className="min-h-[100px] w-full"
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    (editedBio.current = e.target.value)
                  }
                />
              </div>
              <div className="edit-skills w-full">
                <Label htmlFor="skills" className="edit-label">
                  Skills
                </Label>
                <ChipsInput
                  tags={skillsCopy}
                  updateTags={(skills: string[]) => setSkillsCopy([...skills])}
                />
              </div>
              <div className="edit-interests w-full">
                <Label htmlFor="interests" className="edit-label">
                  Interests
                </Label>
                <ChipsInput
                  tags={interestsCopy}
                  updateTags={(interests: string[]) =>
                    setinterestsCopy([...interests])
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditProfileModal
