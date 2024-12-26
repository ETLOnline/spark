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
import {
  AddNewTagsForUser,
  AddExistingTagsForUser,
  DeleteTagsForUser
} from "@/src/server-actions/Tags/Tags"
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

const EditProfileModal: React.FC<EditProfileModalProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [savedSkills, setSavedSkills] = useState<Tag[]>([])
  const [savedInterests, setSavedInterests] = useState<Tag[]>([])
  const [selectedtedSkills, setSelectedtedSkills] = useState<Tag[]>([])
  const [selectedInterests, setSelectedInterests] = useState<Tag[]>([])
  const [newSkills, setNewSkills] = useState<Tag[]>([])
  const [newInterests, setNewInterests] = useState<Tag[]>([])

  const updatedInterests: Tag[] = [
    ...savedInterests,
    ...selectedInterests,
    ...newInterests
  ]
  const updatedSkills: Tag[] = [
    ...savedSkills,
    ...selectedtedSkills,
    ...newSkills
  ]

  const editedBio = useRef<string>(props.bio)

  const { user } = useUser()

  const [addNewTagLoading, addedNewTagData, addNewTagError, addNewTags] =
    useServerAction(AddNewTagsForUser)
  const [
    addExistingTagsLoading,
    addedExistingTagsData,
    addExistingTagsError,
    addExistingTags
  ] = useServerAction(AddExistingTagsForUser)
  const [deleteTagLoading, deletedTagData, deleteTagError, deleteTags] =
    useServerAction(DeleteTagsForUser)
  const [updateBioLoading, updatedBioData, updateBioError, updateBio] =
    useServerAction(UpdateBioForUser)

  useEffect(() => {
    setSavedInterests([...props.interests])
  }, [props.interests])

  useEffect(() => {
    setSavedSkills([...props.skills])
  }, [props.skills])

  const updateTags = async (
    updatedSavedTags: Tag[],
    updatedNewTags: Tag[],
    updatedSelectedTags: Tag[],
    tags: Tag[],
    setTags: (tags: Tag[] | ((tags: Tag[]) => Tag[])) => void,
    type: "skill" | "interest"
  ) => {
    if (!user) return
    try {
      const deletedTagsIds: number[] = tags
        .filter(
          (tag: Tag) =>
            !updatedSavedTags.find((updatedTag) => tag.id === updatedTag.id)
        )
        .map((tag: Tag) => tag.id as number)
      await deleteTags(user.id, deletedTagsIds)
      await addNewTags(
        updatedNewTags.map((tag) => {
          return { name: tag.name, type }
        }),
        user.id
      )
      await addExistingTags(
        updatedSelectedTags.map((tag) => {
          return { name: tag.name, type }
        }),
        user.id
      )
      setTags((tags: Tag[]) => {
        tags = tags.filter((tag) => !deletedTagsIds.includes(tag.id as number)) // remove deleted tags
        return [...tags, ...updatedNewTags, ...updatedSelectedTags]
      })
    } catch (error) {
      console.error(error)
    }
    // const newTags: string[] = []
    // const tagNames = tags.map((tag: Tag) => tag.name)
    // tagsCopy.forEach((tag: Tag) => {
    //   !tagNames.includes(tag.name) && newTags.push(tag.name)
    // })
    // const removedTags: Tag[] = []
    // tags.forEach((tag: Tag) => {
    //   !tagsCopy.find((t: Tag) => t.name === tag.name) &&
    //     removedTags.push(tag)
    // })
    // let resAddedTags: PromiseSettledResult<
    //   ApiErrorResponse | ApiSuccessResponse
    // >[] = []
    // try {
    //   resAddedTags = await Promise.allSettled(
    //     newTags.map((tag: string) =>
    //       AddTagsForUser({ name: tag, type }, user.id)
    //     )
    //   )
    //   const removedTagIds = removedTags.map((tag: Tag) => tag.id)
    //   await deleteTag(user.id, removedTagIds)
    // } catch (error) {
    //   console.error(error)
    // } finally {
    //   let savedTags: Tag[] = []
    //   resAddedTags.forEach((response, i) => {
    //     if (response.status === "fulfilled") {
    //       savedTags.push({
    //         name: newTags[i],
    //         id: (response.value as ApiSuccessResponse).data.tag_id
    //       })
    //     }
    //   })
    //   setTags((tags: Tag[]) => {
    //     tags = tags.filter((tag) => !removedTags.includes(tag)) // remove deleted tags
    //     return [...tags, ...savedTags]
    //   })
    // }
  }

  const saveProfileChanges = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (editedBio.current.length && editedBio.current !== props.bio && user) {
      await updateBio(user.id, editedBio.current)
      props.setBio(editedBio.current)
    }
    updatedSkills.length &&
      (await updateTags(
        savedSkills,
        newSkills,
        selectedtedSkills,
        props.skills,
        props.setSkills,
        "skill"
      ))
    updatedInterests.length &&
      (await updateTags(
        savedInterests,
        newInterests,
        selectedInterests,
        props.interests,
        props.setInterests,
        "interest"
      ))
    setIsOpen(false)
    setSavedSkills([...props.skills])
    setSavedInterests([...props.interests])
    setSelectedInterests([])
    setSelectedtedSkills([])
    setNewInterests([])
    setNewSkills([])
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
                  tags={updatedSkills}
                  updateSavedTags={setSavedSkills}
                  updateNewTags={setNewSkills}
                  updateSelectedTags={setSelectedtedSkills}
                />
              </div>
              <div className="edit-interests w-full">
                <Label htmlFor="interests" className="edit-label">
                  Interests
                </Label>
                <ChipsInput
                  tags={updatedInterests}
                  updateNewTags={setNewInterests}
                  updateSavedTags={setSavedInterests}
                  updateSelectedTags={setSelectedInterests}
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
