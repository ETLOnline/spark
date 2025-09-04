"use client"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dispatch, SetStateAction, useEffect } from "react"
import { useServerAction } from "@/src/hooks/useServerAction"
import { SelectProfile, SelectUser } from "@/src/db/schema"
import { toast } from "@/src/hooks/use-toast"
import { updateUserProfileAction } from "@/src/server-actions/profile/profile"
import moment from "moment"

interface StepTwoProps {
  step: number
  setStep: Dispatch<SetStateAction<number>>
  user: SelectUser
  setUser: Dispatch<SetStateAction<SelectUser | undefined>>
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

export function StepTwo({ step, setStep, user, setUser }: StepTwoProps) {
  const [submitDataLoading, , , submitUserProfileData] = useServerAction(
    updateUserProfileAction
  )

  const form = useForm({
    resolver: zodResolver(userQualificationSchema)
  })

  const error = form.formState.errors

  const handlePrevious = () => {
    setStep((prev) => prev - 1)
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    if (user.profile) {
      const profile = user.profile as SelectProfile
      form.reset({
        degree: profile.degree || "",
        institute: profile.institute || "",
        duration_from: profile.education_start_date || "",
        duration_to: profile.education_end_date || ""
      })
    }
  }, [user])

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
          toast({
            title: "Qualification details saved",
            duration: 2000
          })

          if (!submitDataLoading) {
            setStep((prev) => prev + 1)
            window.scrollTo(0, 0)
          }
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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Education</h3>
        <p className="text-sm text-muted-foreground">
          Add your educational background
        </p>
      </div>

      <div className="space-y-4">
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor={`degree`} className="font-semibold">
                Degree
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

            <div className="space-y-2">
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

          {step < 4 && (
            <div className="flex justify-between pt-6 border-t mt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={step === 1}
              >
                Previous
              </Button>
              <Button type="submit" loading={submitDataLoading}>
                Next
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
