import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../../ui/dialog"
import { Button } from "../../ui/button"
import { Label } from "../../ui/label"
import { Controller, useForm } from "react-hook-form"
import { Input } from "../../ui/input"
import { SelectProfile, SelectUser } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import { updateUserProfileAction } from "@/src/server-actions/profile/profile"
import { toast } from "@/src/hooks/use-toast"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import moment from "moment"
import { UnsavedChangesDialog } from "../../common/unsavedChangesDialog"
import { useConfirmClose } from "@/src/hooks/useConfirmClose"

interface Props {
  user: SelectUser
  profile: SelectProfile
  setprofile: Dispatch<SetStateAction<SelectProfile | null | undefined>>
}

const userQualificationSchema = z
  .object({
    degree: z
      .string()
      .min(1, "Degree name required")
      .max(100, "Maximum 100 characters"),
    institute: z
      .string()
      .min(1, "Institute name required")
      .max(100, "Maximum 100 characters"),

    duration_from: z
      .string()
      .min(4, "Start year required")
      .refine((val) => moment(val, "YYYY", true).isValid(), {
        message: "Invalid start year"
      })
      .refine((val) => moment(val, "YYYY", true).year() >= 1990, {
        message: "Start year must be 1990 or later"
      })
      .refine((val) => moment(val, "YYYY", true).year() <= moment().year(), {
        message: "Start Year cannot be in the future"
      }),

    duration_to: z
      .string()
      .min(4, "End year required")
      .refine((val) => moment(val, "YYYY", true).isValid(), {
        message: "Invalid end year"
      })
  })
  .refine(
    (data) => {
      if (
        !data.duration_to ||
        data.duration_to.trim() === "" ||
        !moment(data.duration_to, "YYYY", true).isValid()
      )
        return true
      const start = moment(data.duration_from, "YYYY", true)
      const end = moment(data.duration_to, "YYYY", true)
      return start.isBefore(end)
    },
    {
      message: "Start year must be before end year",
      path: ["duration_from"]
    }
  )
  .refine(
    (data) => {
      const start = moment(data.duration_from)
      const end = moment(data.duration_to)
      const diff = end.diff(start, "years")

      return diff >= 1 && diff <= 10
    },
    {
      message: "Degree duration must be between 1 and 10 years",
      path: ["duration_to"]
    }
  )

function EditEducationModal({ user, profile, setprofile }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [submitDataLoading, , , submitUserProfileData] = useServerAction(
    updateUserProfileAction
  )

  const form = useForm({
    resolver: zodResolver(userQualificationSchema)
  })

  const error = form.formState.errors
  const isChanged = form.formState.isDirty

  useEffect(() => {
    if (profile) {
      form.reset({
        degree: profile.degree || "",
        institute: profile.institute || "",
        duration_from: profile.education_start_date || "",
        duration_to: profile.education_end_date || ""
      })
    } else {
      form.reset({
        degree: "",
        institute: "",
        duration_from: "",
        duration_to: ""
      })
    }
  }, [profile, isDialogOpen])

  async function handleSubmit(data: any) {
    try {
      if (user) {
        const payload = {
          ...data,
          degree: data.degree,
          institute: data.institute,
          education_start_date: data.duration_from,
          education_end_date: data.duration_to
        }
        const res = await submitUserProfileData(user.unique_id, payload)
        if (res?.success) {
          setprofile({
            ...profile,
            degree: res.data.degree,
            institute: res.data.institute,
            education_start_date: res.data.education_start_date,
            education_end_date: res.data.education_end_date
          })
          toast({
            title: "Qualification details saved",
            duration: 2000
          })
          setIsDialogOpen(false)
        }
      }
    } catch {
      toast({
        title: "Unable to save Data",
        variant: "destructive",
        duration: 2000
      })
    }
  }

  const { showConfirmation, setShowConfirmation, handleClose } =
    useConfirmClose({
      isDirty: isChanged,
      onClose: () => setIsDialogOpen(false)
    })

  const handleDialogChange = (open: boolean) => {
    if (open) {
      setIsDialogOpen(true)
    } else {
      handleClose(false)
    }
  }
  const startYear = form.watch("duration_from")
  const endYear = form.watch("duration_to")
  const degree = form.watch("degree")
  const institute = form.watch("institute")

  useEffect(() => {
    if (degree || institute || startYear || endYear) {
      form.trigger(["degree", "institute", "duration_from", "duration_to"])
    }
  }, [startYear, endYear, form, degree, institute])

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogTrigger asChild>
          <Button variant="edit" size={"sm"}>
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-[425px]"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Edit Education</DialogTitle>
            <DialogDescription>
              Make changes to your Education section here. Click save when
              you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor={`degree`} className="font-semibold">
                  Degree/Qualification
                </Label>
                <Controller
                  name="degree"
                  defaultValue=""
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="degree"
                      placeholder="e.g. Bachelor of Science in Computer Science"
                      {...field}
                    />
                  )}
                />
                {error.degree && (
                  <span className="text-red-500 text-sm">
                    {String(error.degree.message)}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`institute`} className="font-semibold">
                  University/Institution
                </Label>
                <Controller
                  name="institute"
                  defaultValue=""
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="institute"
                      placeholder="e.g. Stanford University"
                      {...field}
                    />
                  )}
                />
                {error.institute && (
                  <span className="text-red-500 text-sm">
                    {String(error.institute.message)}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="duration_from" className="font-semibold">
                  Year/Duration
                </Label>
                <div className="grid grid-cols-12 gap-2 mb-2">
                  <div className="col-span-6">
                    <Controller
                      name="duration_from"
                      defaultValue=""
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="duration_from"
                          placeholder="From"
                          {...field}
                        />
                      )}
                    />
                    {error.duration_from && (
                      <span className="text-red-500 text-sm">
                        {String(error.duration_from.message)}
                      </span>
                    )}
                  </div>
                  <div className="col-span-6">
                    <Controller
                      name="duration_to"
                      defaultValue=""
                      control={form.control}
                      render={({ field }) => (
                        <Input id="duration_to" placeholder="To" {...field} />
                      )}
                    />
                    {error.duration_to && (
                      <span className="text-red-500 text-sm">
                        {String(error.duration_to.message)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button loading={submitDataLoading}>Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        showConfirmation={showConfirmation}
        setShowConfirmation={setShowConfirmation}
        setIsActualDialogOpen={setIsDialogOpen}
      />
    </>
  )
}

export default EditEducationModal
