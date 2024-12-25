import { useEffect, useRef, useState } from "react"
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
import { AddTagForUser, DeleteTagForUser } from "@/src/server-actions/Tags/Tags"
import { useUser } from "@clerk/nextjs"
import { UpdateBioForUser } from "@/src/server-actions/User/User"
import { Tag } from "./types/profile-types"
import { useServerAction } from "@/src/hooks/useServerAction"

type EditProfileModalProps = {
  bio: string
  setBio: (value: string | ((bio: string) => string)) => void
  interests: Tag[]
  setInterests: (tags: Tag[] | ((tags: Tag[]) => Tag[])) => void
  skills: Tag[]
  setSkills: (tags: Tag[] | ((tags: Tag[]) => Tag[])) => void
}

type ApiSuccessResponse = { success: boolean; data: any }
type ApiErrorResponse = { error: unknown; success: boolean }

const EditProfileModal: React.FC<EditProfileModalProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [skillsCopy, setSkillsCopy] = useState<Omit<Tag, "id">[]>([])
  const [interestsCopy, setinterestsCopy] = useState<Omit<Tag, "id">[]>([])

  const editedBio = useRef<string>(props.bio)

  const { user } = useUser()

  // const [addTagLoading, addedTagData, addTagError, addTag] =
  //   useServerAction(AddTagForUser)
  const [deleteTagLoading, deletedTagData, deleteTagError, deleteTag] =
    useServerAction(DeleteTagForUser)
  const [updateBioLoading, updatedBioData, updateBioError, updateBio] =
    useServerAction(UpdateBioForUser)

  useEffect(() => {
    setinterestsCopy([...props.interests])
  }, [props.interests])

  useEffect(() => {
    setSkillsCopy([...props.skills])
  }, [props.skills])

  const updateTags = async (
    tagsCopy: Omit<Tag, "id">[],
    tags: Tag[],
    setTags: (tags: Tag[] | ((tags: Tag[]) => Tag[])) => void,
    type: "skill" | "interest"
  ) => {
    if (!user) return
    const newTags: string[] = []
    const tagNames = tags.map((tag: Tag) => tag.name)
    tagsCopy.forEach((tag: Omit<Tag, "id">) => {
      !tagNames.includes(tag.name) && newTags.push(tag.name)
    })
    const removedTags: Tag[] = []
    tags.forEach((tag: Tag) => {
      !tagsCopy.find((t: Omit<Tag, "id">) => t.name === tag.name) &&
        removedTags.push(tag)
    })
    let resAddedTags: PromiseSettledResult<
      ApiErrorResponse | ApiSuccessResponse
    >[] = []
    try {
      resAddedTags = await Promise.allSettled(
        newTags.map((tag: string) =>
          AddTagForUser({ name: tag, type }, user.id)
        )
      )
      const removedTagIds = removedTags.map((tag: Tag) => tag.id)
      await deleteTag(user.id, removedTagIds)
    } catch (error) {
      console.error(error)
    } finally {
      let savedTags: Tag[] = []
      resAddedTags.forEach((response, i) => {
        if (response.status === "fulfilled") {
          savedTags.push({
            name: newTags[i],
            id: (response.value as ApiSuccessResponse).data.tag_id
          })
        }
      })
      setTags((tags: Tag[]) => {
        tags = tags.filter((tag) => !removedTags.includes(tag)) // remove deleted tags
        return [...tags, ...savedTags]
      })
    }
  }

  const saveProfileChanges = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (editedBio.current.length && user) {
      await updateBio(user.id, editedBio.current)
      props.setBio(editedBio.current)
    }
    skillsCopy.length &&
      (await updateTags(skillsCopy, props.skills, props.setSkills, "skill"))
    interestsCopy.length &&
      (await updateTags(
        interestsCopy,
        props.interests,
        props.setInterests,
        "interest"
      ))
    setIsOpen(false)
    setSkillsCopy([...props.skills])
    setinterestsCopy([...props.interests])
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
                  updateTags={(skills: Omit<Tag, "id">[]) =>
                    setSkillsCopy([...skills])
                  }
                />
              </div>
              <div className="edit-interests w-full">
                <Label htmlFor="interests" className="edit-label">
                  Interests
                </Label>
                <ChipsInput
                  tags={interestsCopy}
                  updateTags={(interests: Omit<Tag, "id">[]) =>
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
