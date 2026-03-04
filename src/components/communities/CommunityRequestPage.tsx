"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { zodResolver } from "@hookform/resolvers/zod"
import React from "react"
import { Controller, useForm } from "react-hook-form"
import z from "zod"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"
import { useServerAction } from "@/src/hooks/useServerAction"
import { CreateCommunityRequestAction } from "@/src/server-actions/Community/CommunityRequests/CommunityRequests"
import { useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { useToast } from "@/src/hooks/use-toast"
import { useRouter } from "next/navigation"

const communityRequestFormSchema = z.object({
  university_name: z.string().min(1, "University name is required"),
  official_university_email: z
    .string()
    .email("Invalid email address")
    .min(1, "Official university email is required"),
  contact_person_name: z.string().optional(),
  designation: z.string().optional(),
  contact_number: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true // allow empty since optional
        const cleaned = val.replace(/[\s-]/g, "")
        return /^\+?[0-9]{7,15}$/.test(cleaned)
      },
      {
        message: "Enter a valid phone number"
      }
    ),
  university_website: z.string().optional(),
  city: z.string().optional(),
  description: z.string().optional(),
  esitmated_number_of_students: z.string().optional(),
  intended_usage: z.string().optional()
})

function CommunityRequestPage() {
  const [createRequestLoading, , , CreateCommunityRequest] = useServerAction(
    CreateCommunityRequestAction
  )

  const authUser = useAtomValue(userStore.AuthUser)

  const form = useForm({
    resolver: zodResolver(communityRequestFormSchema),
    defaultValues: {
      university_name: "",
      official_university_email: "",
      contact_person_name: "",
      designation: "",
      contact_number: "",
      university_website: "",
      city: "",
      description: "",
      esitmated_number_of_students: "",
      intended_usage: ""
    }
  })

  const error = form.formState.errors
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    try {
      if (data) {
        const requestData = {
          ...data,
          contact_person_id: authUser?.unique_id
        }

        const res = await CreateCommunityRequest(requestData)

        if (res?.success && res?.data) {
          form.reset()
          toast({
            title: "Request Submitted",
            description:
              "Your community request has been submitted successfully. We will review it and get back to you soon."
          })
          router.push("/communities")
        }
      }
    } catch {
      console.error("Failed to create community request")
    }
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Request a New Community</CardTitle>
        <CardDescription>
          Fill out the form below to request a private community for managing
          projects, FYPs, or university collaborations. Our team will review
          your request and get back to you soon.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Form fields for requesting a new community */}
        <form
          className="grid w-full gap-4 py-4"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="university_name">University Name</Label>
            <Controller
              name="university_name"
              control={form.control}
              render={({ field }) => <Input id="university_name" {...field} />}
            />
            {error.university_name && (
              <p className="text-sm text-red-500">
                {error.university_name.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="official_university_email">
              Official University Email
            </Label>
            <Controller
              name="official_university_email"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="official_university_email"
                  placeholder="Must be an institutional domain"
                  {...field}
                />
              )}
            />
            {error.official_university_email && (
              <p className="text-sm text-red-500">
                {error.official_university_email.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="contact_person_name">Contact Person Name</Label>
            <Controller
              name="contact_person_name"
              control={form.control}
              render={({ field }) => (
                <Input id="contact_person_name" {...field} />
              )}
            />
            {error.contact_person_name && (
              <p className="text-sm text-red-500">
                {error.contact_person_name.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="designation">Designation</Label>
            <Controller
              name="designation"
              control={form.control}
              render={({ field }) => <Input id="designation" {...field} />}
            />
            {error.designation && (
              <p className="text-sm text-red-500">
                {error.designation.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="contact_number">Contact Number</Label>
            <Controller
              name="contact_number"
              control={form.control}
              render={({ field }) => <Input id="contact_number" {...field} />}
            />
            {error.contact_number && (
              <p className="text-sm text-red-500">
                {error.contact_number.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="university_website">University Website</Label>
            <Controller
              name="university_website"
              control={form.control}
              render={({ field }) => (
                <Input id="university_website" {...field} />
              )}
            />
            {error.university_website && (
              <p className="text-sm text-red-500">
                {error.university_website.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="city">Country/City</Label>
            <Controller
              name="city"
              control={form.control}
              render={({ field }) => <Input id="city" {...field} />}
            />
            {error.city && (
              <p className="text-sm text-red-500">{error.city.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Short Description</Label>
            <Controller
              name="description"
              control={form.control}
              render={({ field }) => (
                <Textarea
                  id="description"
                  placeholder="Purpose of joining SPARK"
                  {...field}
                />
              )}
            />
            {error.description && (
              <p className="text-sm text-red-500">
                {error.description.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="esitmated_number_of_students">
              Estimated Number of Students/Advisors
            </Label>
            <Controller
              name="esitmated_number_of_students"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="esitmated_number_of_students"
                  type="number"
                  {...field}
                />
              )}
            />
            {error.esitmated_number_of_students && (
              <p className="text-sm text-red-500">
                {error.esitmated_number_of_students.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="intended_usage">Intended Usage</Label>
            <Controller
              name="intended_usage"
              control={form.control}
              render={({ field }) => (
                <Textarea
                  id="intended_usage"
                  placeholder="e.g., FYPs, research, hackathons, etc"
                  {...field}
                />
              )}
            />
            {error.intended_usage && (
              <p className="text-sm text-red-500">
                {error.intended_usage.message}
              </p>
            )}
          </div>

          <CardFooter className="justify-end p-0">
            {/* Submit button for the form */}
            <Button loading={createRequestLoading} type="submit">
              Submit Request
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export default CommunityRequestPage
