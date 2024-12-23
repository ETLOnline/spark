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
import { Label } from "../../ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import ChipsInput from "@/src/components/chips-input"
import {
  AddSkillForUser,
  DeleteSkillForUser,
  SkillAdder,
  SkillDeleter
} from "@/src/server-actions/Skills/skills"
import { useUser } from "@clerk/nextjs"
import {
  AddInterestForUser,
  InterestAdder,
  InterestDeleter
} from "@/src/server-actions/Interests/Interests"
import { UpdateBioForUser } from "@/src/server-actions/User/User"

type EditProfileModalProps = {
  bio: string
  setBio: (value: string | ((bio: string) => string)) => void
  interests: string[]
  setInterests: (tags: string[] | ((tags: string[]) => string[])) => void
  skills: string[]
  setSkills: (tags: string[] | ((tags: string[]) => string[])) => void
}

const EditProfileModal: React.FC<EditProfileModalProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [skillsCopy, setSkillsCopy] = useState<string[]>([...props.skills])
  const [interestsCopy, setinterestsCopy] = useState<string[]>([
    ...props.interests
  ])
  const editedBio = useRef<string>(props.bio)
  const { user } = useUser()

  const updateTags = async (
    tagsCopy: string[],
    tags: string[],
    setTags: (tags: string[] | ((tags: string[]) => string[])) => void,
    saveTagtoDB: SkillAdder | InterestAdder,
    deleteTagFromDB: SkillDeleter | InterestDeleter
  ) => {
    if (!user) return
    const newTags = tagsCopy.filter((tag) => !tags.includes(tag))
    const removedTags = tags.filter((tag) => !tagsCopy.includes(tag))
    let resAddedTags: PromiseSettledResult<
      { success: boolean; data: unknown } | { error: unknown; success: boolean }
    >[] = []
    let resDeletedTags: PromiseSettledResult<
      { success: boolean; data: unknown } | { error: unknown; success: boolean }
    >[] = []
    try {
      resAddedTags = await Promise.allSettled(
        newTags.map((tag: string) => saveTagtoDB({ user: user.id, name: tag }))
      )
      resDeletedTags = await Promise.allSettled(
        removedTags.map((tag: string) => deleteTagFromDB(user.id, tag))
      )
    } catch (error) {
      console.error(error)
    } finally {
      let savedTags: string[] = []
      let deletedTags: string[] = []
      resAddedTags.forEach((response, i) => {
        if (response.status === "fulfilled") {
          savedTags.push(newTags[i])
        }
      })
      resDeletedTags.forEach((response, i) => {
        if (response.status === "fulfilled") {
          deletedTags.push(removedTags[i])
        }
      })
      setTags((tags: string[]) => {
        tags = tags.filter((tag) => !removedTags.includes(tag)) // remove deleted tags
        return [...tags, ...savedTags]
      })
    }
  }

  const saveProfileChanges = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      if (editedBio.current.length && user) {
        await UpdateBioForUser(user.id, editedBio.current)
        props.setBio(editedBio.current)
      }
    } catch (error) {
      console.error(error)
    }
    skillsCopy.length &&
      (await updateTags(
        skillsCopy,
        props.skills,
        props.setSkills,
        AddSkillForUser,
        DeleteSkillForUser
      ))
    interestsCopy.length &&
      (await updateTags(
        interestsCopy,
        props.interests,
        props.setInterests,
        AddInterestForUser,
        DeleteSkillForUser
      ))
    setIsOpen(false)
    setSkillsCopy([])
    setinterestsCopy([])
    editedBio.current = ""
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
        <form onSubmit={saveProfileChanges} className="edit-profile-form">
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
