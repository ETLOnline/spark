"use client"

import { useEffect, useState } from "react"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { Textarea } from "@/src/components/ui/textarea"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { UnsavedChangesDialog } from "@/src/components/common/unsavedChangesDialog"
import { toast } from "@/src/hooks/use-toast"
import { useConfirmClose } from "@/src/hooks/useConfirmClose"
import { useServerAction } from "@/src/hooks/useServerAction"
import useAuthUserRefresh from "@/src/hooks/useAuthUserRefresh"
import { SelectSpace } from "@/src/db/schema"
import {
  AttachSpaceUserAction,
  CreateIndependentSpaceAction,
  GetSpacesByCreatorAction,
  IsIndependentSlugAvailableAction
} from "@/src/server-actions/Space/Space"
import { RespondToSessionRequestAction } from "@/src/server-actions/Mentor/MentorActions"
import { slugify } from "@/src/utils/helpers"
import { useDebouncedCallback } from "use-debounce"
import { SessionRequestWithMentee } from "./SessionRequestsScreen"

type WorkspaceOption = "create" | "existing" | "none"
type Step = "choose" | "details"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: SessionRequestWithMentee | null
  mentorId: string
  onAccepted: (requestId: number) => void
}

export default function AcceptSessionRequestDialog({
  open,
  onOpenChange,
  request,
  mentorId,
  onAccepted
}: Props) {
  const [step, setStep] = useState<Step>("choose")
  const [option, setOption] = useState<WorkspaceOption>("none")
  const [executingAction, setExecutingAction] = useState(false)

  // "Create a new space" fields — spaces created here are always private
  // (they're only ever surfaced on the mentor's profile) and always published.
  const [spaceName, setSpaceName] = useState("")
  const [spaceSlug, setSpaceSlug] = useState("")
  const [description, setDescription] = useState("")
  const [slugMessage, setSlugMessage] = useState("")
  const [slugError, setSlugError] = useState("")

  // "Add to an existing space" picker
  const [spaces, setSpaces] = useState<SelectSpace[]>([])
  const [selectedSpaceId, setSelectedSpaceId] = useState("")

  const [spacesLoading, , , getSpacesByCreator] = useServerAction(
    GetSpacesByCreatorAction
  )
  const [isSlugAvailableLoading, , , isSlugAvailable] = useServerAction(
    IsIndependentSlugAvailableAction
  )
  const [, , , createIndependentSpace] = useServerAction(
    CreateIndependentSpaceAction
  )
  const [, , , attachSpaceUser] = useServerAction(AttachSpaceUserAction)
  const [, , , respondToRequest] = useServerAction(
    RespondToSessionRequestAction
  )
  const { refreshAuthUser } = useAuthUserRefresh()

  const isDirty =
    option === "create" &&
    (spaceName.trim() !== "" || description.trim() !== "")

  const { showConfirmation, setShowConfirmation, handleClose } =
    useConfirmClose({
      isDirty,
      onClose: () => onOpenChange(false)
    })

  const debouncedCheckSlug = useDebouncedCallback(async (slug: string) => {
    const result = await isSlugAvailable(slug)
    if (result?.success && result.data) {
      setSlugError("")
      setSlugMessage(`${slug} is available`)
    } else {
      setSlugMessage("")
      setSlugError(`${slug} is already taken`)
    }
  }, 800)

  useEffect(() => {
    const generated = slugify(
      spaceName.trim().replaceAll(" ", "-").toLowerCase()
    )
    setSpaceSlug(generated)
    if (generated) {
      debouncedCheckSlug(generated)
    } else {
      setSlugMessage("")
      setSlugError("")
    }
  }, [spaceName])

  useEffect(() => {
    if (!open) return
    setStep("choose")
    setOption("none")
    setSpaceName("")
    setSpaceSlug("")
    setDescription("")
    setSlugMessage("")
    setSlugError("")
    setSelectedSpaceId("")

    const fetchSpaces = async () => {
      const res = await getSpacesByCreator(mentorId)
      if (res?.success && res.data) {
        setSpaces(res.data.spaces)
      }
    }
    fetchSpaces()
  }, [open, request?.id])

  function handleNext() {
    if (option === "none") {
      handleConfirm()
    } else {
      setStep("details")
    }
  }

  async function handleConfirm() {
    if (executingAction || !request) return
    setExecutingAction(true)

    let spaceIdToLink: string | null = null

    try {
      if (option === "create") {
        if (!spaceName.trim() || !description.trim() || slugError) {
          toast({
            variant: "destructive",
            title: "Please fill in the space details",
            duration: 3000
          })
          return
        }

        const created = await createIndependentSpace({
          space_name: spaceName.trim(),
          space_slug: spaceSlug,
          description: description.trim(),
          space_type: "private",
          publish_space: 1,
          created_by: mentorId,
          ownerId: mentorId
        })

        if (!created?.success || !created.data) {
          toast({
            variant: "destructive",
            title: "Unable to create space",
            duration: 3000
          })
          return
        }
        spaceIdToLink = created.data.id

        await refreshAuthUser()

        const attached = await attachSpaceUser(
          created.data.id,
          request.mentee.unique_id
        )
        if (!attached?.success) {
          toast({
            variant: "destructive",
            title: "Space created, but the mentee couldn't be added",
            description: "You can add them from the space's member settings.",
            duration: 4000
          })
        }

        const res = await respondToRequest(
          request.id,
          "accepted",
          created.data.id
        )
        if (res?.success) {
          onAccepted(request.id)
        } else {
          toast({
            variant: "destructive",
            title: "Something went wrong",
            description: res?.error ?? "Please try again.",
            duration: 3000
          })
        }
        return
      } else if (option === "existing") {
        if (!selectedSpaceId) {
          toast({
            variant: "destructive",
            title: "Please select a space",
            duration: 3000
          })
          return
        }

        const selectedSpace = spaces.find((s) => s.id === selectedSpaceId)
        const isAlreadyMember = selectedSpace?.users?.some(
          (u) => u.user_id === request.mentee.unique_id
        )
        spaceIdToLink = selectedSpaceId

        if (!isAlreadyMember) {
          const attached = await attachSpaceUser(
            selectedSpaceId,
            request.mentee.unique_id
          )
          if (!attached?.success) {
            toast({
              variant: "destructive",
              title: "Unable to add mentee to the space",
              duration: 3000
            })
            return
          }
        }

        const res = await respondToRequest(
          request.id,
          "accepted",
          selectedSpaceId
        )
        if (res?.success) {
          onAccepted(request.id)
        } else {
          toast({
            variant: "destructive",
            title: "Something went wrong",
            description: res?.error ?? "Please try again.",
            duration: 3000
          })
        }
        return
      }

      const res = await respondToRequest(request.id, "accepted", spaceIdToLink)
      if (res?.success) {
        onAccepted(request.id)
      } else {
        toast({
          variant: "destructive",
          title: "Something went wrong",
          description: res?.error ?? "Please try again.",
          duration: 3000
        })
      }
    } finally {
      setExecutingAction(false)
    }
  }

  const detailsConfirmDisabled =
    executingAction ||
    (option === "existing" && !selectedSpaceId) ||
    (option === "create" &&
      (!spaceName.trim() || !description.trim() || !!slugError))

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[520px] max-h-[90dvh] overflow-y-auto">
          {step === "choose" ? (
            <>
              <DialogHeader>
                <DialogTitle>Set Up Workspace</DialogTitle>
                <DialogDescription>
                  Choose how you&apos;d like to structure this engagement before
                  accepting.
                </DialogDescription>
              </DialogHeader>

              <RadioGroup
                value={option}
                onValueChange={(value) => setOption(value as WorkspaceOption)}
              >
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem
                      value="create"
                      id="workspace-create"
                      className="mt-1"
                    />
                    <Label
                      htmlFor="workspace-create"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="p-3 border rounded-lg space-y-1">
                        <span className="font-medium">Create a new space</span>
                        <p className="text-sm text-muted-foreground">
                          A fresh space with chat, file sharing, and a scrum
                          board. You&apos;ll be the admin.
                        </p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <RadioGroupItem
                      value="existing"
                      id="workspace-existing"
                      className="mt-1"
                    />
                    <Label
                      htmlFor="workspace-existing"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="p-3 border rounded-lg space-y-1">
                        <span className="font-medium">
                          Add to an existing space
                        </span>
                        <p className="text-sm text-muted-foreground">
                          The mentee will be added as a member of one of your
                          existing spaces.
                        </p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <RadioGroupItem
                      value="none"
                      id="workspace-none"
                      className="mt-1"
                    />
                    <Label
                      htmlFor="workspace-none"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="p-3 border rounded-lg space-y-1">
                        <span className="font-medium">No space</span>
                        <p className="text-sm text-muted-foreground">
                          Confirm the session without a workspace.
                        </p>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => handleClose(false)}
                  disabled={executingAction}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleNext}
                  loading={option === "none" && executingAction}
                  disabled={executingAction}
                >
                  {option === "none" ? "Confirm & Accept" : "Next"}
                </Button>
              </DialogFooter>
            </>
          ) : option === "create" ? (
            <>
              <DialogHeader>
                <DialogTitle>Create a New Space</DialogTitle>
                <DialogDescription>
                  Fill in the details for the mentee&apos;s new space.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="space_name">Space Name</Label>
                  <Input
                    id="space_name"
                    placeholder="Enter space name"
                    value={spaceName}
                    onChange={(e) => setSpaceName(e.target.value)}
                    maxLength={30}
                  />
                  {spaceSlug && (
                    <p className="text-xs text-muted-foreground">
                      {isSlugAvailableLoading
                        ? "Checking availability..."
                        : slugError || slugMessage}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="space_description">Description</Label>
                  <Textarea
                    id="space_description"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={150}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setStep("choose")}
                  disabled={executingAction}
                >
                  Back
                </Button>
                <Button
                  onClick={handleConfirm}
                  loading={executingAction}
                  disabled={detailsConfirmDisabled}
                >
                  Create Space & Accept
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Choose a Space</DialogTitle>
                <DialogDescription>
                  Select one of your existing spaces to add the mentee to.
                </DialogDescription>
              </DialogHeader>

              {spacesLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader size={LoaderSizes.sm} />
                </div>
              ) : spaces.length > 0 ? (
                <RadioGroup
                  value={selectedSpaceId}
                  onValueChange={setSelectedSpaceId}
                >
                  <div className="space-y-2">
                    {spaces.map((space) => (
                      <div
                        key={space.id}
                        className="flex items-center space-x-3"
                      >
                        <RadioGroupItem
                          value={space.id}
                          id={`space-${space.id}`}
                        />
                        <Label
                          htmlFor={`space-${space.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="p-2 border rounded-lg">
                            <span className="font-medium">
                              {space.space_name}
                            </span>
                            {space.description && (
                              <p className="text-sm text-muted-foreground truncate">
                                {space.description}
                              </p>
                            )}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  You don&apos;t have any spaces yet — go back and create one
                  instead.
                </p>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setStep("choose")}
                  disabled={executingAction}
                >
                  Back
                </Button>
                <Button
                  onClick={handleConfirm}
                  loading={executingAction}
                  disabled={detailsConfirmDisabled}
                >
                  Add & Accept
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        showConfirmation={showConfirmation}
        setShowConfirmation={setShowConfirmation}
        setIsActualDialogOpen={(next) => {
          if (typeof next === "boolean") onOpenChange(next)
        }}
      />
    </>
  )
}
