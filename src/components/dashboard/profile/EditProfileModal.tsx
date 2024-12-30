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
import ChipsInput from "@/src/components/ChipsInput/ChipsInput"
import {
  AddNewTagsForUser,
  AddExistingTagsForUser,
  DeleteTagsForUser,
  SearchTagsForSuggestions
} from "@/src/server-actions/Tag/Tag"
import { UpdateBioForUser } from "@/src/server-actions/User/User"
import { Tag, TagStatus, TagType } from "./types/profile-types.d"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useAtomValue, useSetAtom } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { profileStore } from "@/src/store/profile/profileStore"

const EditProfileModal: React.FC = () => {
  const user = useAtomValue(userStore.Iam)
  const bio = useAtomValue(profileStore.bio)
  const skills = useAtomValue(profileStore.skills)
  const interests = useAtomValue(profileStore.interests)
  const setInterests = useSetAtom(profileStore.interests)
  const setSkills = useSetAtom(profileStore.skills)
  const setBio = useSetAtom(profileStore.bio)

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

  const editedBio = useRef<string>(bio)

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
  const [searchTagsLoading, searchedTags, searchTagsError, searchTags] =
    useServerAction(SearchTagsForSuggestions)

  const suggestions: Tag[] = searchedTags?.data
    ? searchedTags.data.map((tag) => ({
        name: tag.name,
        id: tag.id,
        status: TagStatus[2] as const
      }))
    : []

  useEffect(() => {
    setSavedInterests([...interests])
  }, [interests])

  useEffect(() => {
    setSavedSkills([...skills])
  }, [skills])

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
      await deleteTags(user.external_auth_id, deletedTagsIds)
      await addNewTags(
        updatedNewTags.map((tag) => {
          return { name: tag.name, type }
        }),
        user.external_auth_id
      )
      await addExistingTags(
        updatedSelectedTags.map((tag) => {
          return { name: tag.name, id: tag.id, type }
        }),
        user.external_auth_id
      )
      setTags((tags: Tag[]) => {
        tags = tags.filter((tag) => !deletedTagsIds.includes(tag.id as number)) // remove deleted tags
        return [...tags, ...updatedNewTags, ...updatedSelectedTags]
      })
    } catch (error) {
      console.error(error)
    }
  }

  const saveProfileChanges = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (editedBio.current.length && editedBio.current !== bio && user) {
      await updateBio(user.external_auth_id, editedBio.current)
      setBio(editedBio.current)
    }
    updatedSkills.length &&
      (await updateTags(
        savedSkills,
        newSkills,
        selectedtedSkills,
        skills,
        setSkills,
        "skill"
      ))
    updatedInterests.length &&
      (await updateTags(
        savedInterests,
        newInterests,
        selectedInterests,
        interests,
        setInterests,
        "interest"
      ))
    setIsOpen(false)
    setSavedSkills([...skills])
    setSavedInterests([...interests])
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
                  defaultValue={bio}
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
                  tagType={TagType.skill}
                  suggestions={suggestions}
                  searchSuggestions={searchTags}
                  loadingSuggestions={searchTagsLoading}
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
                  tagType={TagType.interest}
                  suggestions={suggestions}
                  searchSuggestions={searchTags}
                  loadingSuggestions={searchTagsLoading}
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
