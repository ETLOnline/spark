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
          contact_person_id: authUser?.unique_id,
          status: "pending"
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

  const FormField = ({ label, error: fieldError, children }: any) => (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {fieldError && (
        <p className="text-xs text-red-500">{fieldError.message}</p>
      )}
    </div>
  )

  return (
    <div className="py-12 px-4">
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>Request a new community</CardTitle>
          <CardDescription>
            Fill out the form below to request a private community for managing
            projects, FYPs, or university collaborations. Our team will review
            your request and get back to you soon.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          {/* Form fields for requesting a new community */}
          <form
            className="space-y-8"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            {/* Essential Information Section */}
            <div>
              <h3 className="text-base font-semibold mb-4 pb-2 border-b">
                Essential Information
              </h3>
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="University Name *"
                    error={error.university_name}
                  >
                    <Controller
                      name="university_name"
                      control={form.control}
                      render={({ field }) => (
                        <Input id="university_name" {...field} />
                      )}
                    />
                  </FormField>

                  <FormField
                    label="Official University Email *"
                    error={error.official_university_email}
                  >
                    <Controller
                      name="official_university_email"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="official_university_email"
                          placeholder="example@university.edu"
                          type="email"
                          {...field}
                        />
                      )}
                    />
                  </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="University Website"
                    error={error.university_website}
                  >
                    <Controller
                      name="university_website"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="university_website"
                          placeholder="https://www.university.edu"
                          type="url"
                          {...field}
                        />
                      )}
                    />
                  </FormField>

                  <FormField
                    label="Estimated Number of Students/Advisors"
                    error={error.esitmated_number_of_students}
                  >
                    <Controller
                      name="esitmated_number_of_students"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="esitmated_number_of_students"
                          type="number"
                          placeholder="e.g., 100"
                          {...field}
                        />
                      )}
                    />
                  </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Country/City" error={error.city}>
                    <Controller
                      name="city"
                      control={form.control}
                      render={({ field }) => <Input id="city" {...field} />}
                    />
                  </FormField>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <h3 className="text-base font-semibold mb-4 pb-2 border-b">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Contact Person Name"
                  error={error.contact_person_name}
                >
                  <Controller
                    name="contact_person_name"
                    control={form.control}
                    render={({ field }) => (
                      <Input id="contact_person_name" {...field} />
                    )}
                  />
                </FormField>

                <FormField label="Designation" error={error.designation}>
                  <Controller
                    name="designation"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="designation"
                        placeholder="e.g., Professor, Department Head"
                        {...field}
                      />
                    )}
                  />
                </FormField>

                <FormField label="Contact Number" error={error.contact_number}>
                  <Controller
                    name="contact_number"
                    control={form.control}
                    render={({ field }) => (
                      <Input id="contact_number" {...field} />
                    )}
                  />
                </FormField>
              </div>
            </div>

            {/* Purpose Section */}
            <div>
              <h3 className="text-base font-semibold mb-4 pb-2 border-b">
                Purpose
              </h3>
              <div className="space-y-6">
                <FormField label="Short Description" error={error.description}>
                  <Controller
                    name="description"
                    control={form.control}
                    render={({ field }) => (
                      <Textarea
                        id="description"
                        placeholder="Tell us about your purpose of joining..."
                        className="min-h-24"
                        {...field}
                      />
                    )}
                  />
                </FormField>

                <FormField label="Intended Usage" error={error.intended_usage}>
                  <Controller
                    name="intended_usage"
                    control={form.control}
                    render={({ field }) => (
                      <Textarea
                        id="intended_usage"
                        placeholder="e.g., FYPs, research, hackathons, etc."
                        className="min-h-24"
                        {...field}
                      />
                    )}
                  />
                </FormField>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t">
              <Button loading={createRequestLoading} type="submit">
                Submit Request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CommunityRequestPage
