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
interface Props {
  user: SelectUser
  profile: SelectProfile
  setprofile: Dispatch<SetStateAction<SelectProfile | null | undefined>>
}

const userQualificationSchema = z
  .object({
    degree: z.string().min(1, "Required"),
    institute: z.string().min(1, "Required"),

    duration_from: z
      .string()
      .refine((val) => moment(val, "YYYY", true).isValid(), {
        message: "Invalid start year"
      })
      .refine((val) => moment(val, "YYYY", true).year() >= 1990, {
        message: "Start year must be 1990 or later"
      }),

    duration_to: z
      .string()
      .refine((val) => moment(val, "YYYY", true).isValid(), {
        message: "Invalid end year"
      })
  })
  .refine(
    (data) => {
      const start = moment(data.duration_from)
      const end = moment(data.duration_to)
      return start < end
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

  useEffect(() => {
    if (profile) {
      form.reset({
        degree: profile.degree || "",
        institute: profile.institute || "",
        duration_from: profile.education_start_date || "",
        duration_to: profile.education_end_date || ""
      })
    }
  }, [profile])

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

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="edit" size={"sm"}>
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Education</DialogTitle>
          <DialogDescription>
            Make changes to your Education section here. Click save when you're
            done.
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
                      <Input id="duration_from" placeholder="From" {...field} />
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
  )
}

export default EditEducationModal
