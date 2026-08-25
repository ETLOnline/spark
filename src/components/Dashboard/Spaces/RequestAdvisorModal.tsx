"use client"

import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/src/components/ui/tabs"
import { FileUpload } from "@/src/components/ui/file-upload"
import TagSelect from "@/src/components/TagsInput/tags"
import { MultiSelectOption } from "@/src/components/ui/multi-select"
import { Badge } from "@/src/components/ui/badge"
import { Separator } from "@/src/components/ui/separator"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { X } from "lucide-react"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useConfirmClose } from "@/src/hooks/useConfirmClose"
import { UnsavedChangesDialog } from "@/src/components/common/unsavedChangesDialog"
import { toast } from "@/src/hooks/use-toast"
import { CreateAdvisorRequestAction } from "@/src/server-actions/AdvisorRequest/AdvisorRequest"
import { ScrollArea } from "../../ui/scroll-area"
import {
  ADVISOR_REQUEST_PROPOSAL_ACCEPT,
  ADVISOR_REQUEST_PROPOSAL_MAX_FILE_SIZE
} from "@/src/utils/constants"

const requestAdvisorSchema = z
  .object({
    group_members: z
      .array(
        z.object({
          name: z.string().min(1, "Name is required"),
          registration_number: z
            .string()
            .min(1, "Registration number is required")
        })
      )
      .min(1, "Add at least one group member"),
    supervisor_name: z
      .string()
      .min(1, "University supervisor name is required"),
    fyp_title: z.string().min(1, "FYP title is required"),
    abstract: z.string().min(1, "Abstract is required"),
    problem_statement: z.string().min(1, "Problem statement is required"),
    tech_stack: z.string().min(1, "Tech stack is required"),
    domain_tag_id: z.number().optional(),
    proposal_method: z.enum(["file", "link"]),
    proposal_link: z.string().optional()
  })
  .refine((data) => typeof data.domain_tag_id === "number", {
    message: "Domain is required",
    path: ["domain_tag_id"]
  })
  .refine(
    (data) =>
      data.proposal_method === "link"
        ? !!data.proposal_link && data.proposal_link.trim().length > 0
        : true,
    { message: "Proposal link is required", path: ["proposal_link"] }
  )

type RequestAdvisorFormValues = z.infer<typeof requestAdvisorSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  spaceId: string
  onSubmitted: () => void
}

function SectionHeading({ step, title }: { step: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <Badge
        variant="outline"
        className="shrink-0 border-primary/40 bg-primary/10 text-primary"
      >
        {step}
      </Badge>
      <span className="text-sm font-semibold shrink-0">{title}</span>
      <Separator className="flex-1" />
    </div>
  )
}

function RequestAdvisorModal({
  open,
  onOpenChange,
  spaceId,
  onSubmitted
}: Props) {
  const [selectedDomain, setSelectedDomain] = useState<MultiSelectOption[]>([])
  const [proposalFile, setProposalFile] = useState<File | null>(null)
  const [submitting, , , submitRequest] = useServerAction(
    CreateAdvisorRequestAction
  )

  const form = useForm<RequestAdvisorFormValues>({
    resolver: zodResolver(requestAdvisorSchema),
    defaultValues: {
      group_members: [{ name: "", registration_number: "" }],
      supervisor_name: "",
      fyp_title: "",
      abstract: "",
      problem_statement: "",
      tech_stack: "",
      proposal_method: "file",
      proposal_link: ""
    }
  })

  const {
    control,
    formState: { errors, isDirty }
  } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: "group_members"
  })

  const proposalMethod = form.watch("proposal_method")

  useEffect(() => {
    if (!open) return

    form.reset({
      group_members: [{ name: "", registration_number: "" }],
      supervisor_name: "",
      fyp_title: "",
      abstract: "",
      problem_statement: "",
      tech_stack: "",
      proposal_method: "file",
      proposal_link: ""
    })
    setProposalFile(null)
    setSelectedDomain([])
  }, [open])

  useEffect(() => {
    const nextDomainTagId = selectedDomain[0]
      ? Number(selectedDomain[0].value)
      : undefined

    if (form.getValues("domain_tag_id") === nextDomainTagId) return

    form.setValue("domain_tag_id", nextDomainTagId, {
      shouldDirty: true,
      shouldValidate: true
    })
  }, [selectedDomain])

  const { showConfirmation, setShowConfirmation, handleClose } =
    useConfirmClose({
      isDirty,
      onClose: () => onOpenChange(false)
    })

  const handleDialogChange = (nextOpen: boolean) => {
    if (nextOpen) onOpenChange(true)
    else handleClose(false)
  }

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleFileChange = (files: File[]) => {
    const file = files[0]
    if (!file) {
      setProposalFile(null)
      return
    }

    if (file.size > ADVISOR_REQUEST_PROPOSAL_MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Proposal file must be 200MB or smaller."
      })
      return
    }

    setProposalFile(file)
  }

  async function handleSubmit(data: RequestAdvisorFormValues) {
    let proposalFilePayload = null

    if (data.proposal_method === "file") {
      if (!proposalFile) {
        toast({
          title: "Proposal required",
          description: "Please upload the project proposal.",
          variant: "destructive"
        })
        return
      }
      const base64 = await fileToBase64(proposalFile)
      proposalFilePayload = {
        name: proposalFile.name,
        sizeBytes: proposalFile.size,
        base64,
        mimeType: proposalFile.type
      }
    }

    const submitData = {
      group_members: data.group_members,
      supervisor_name: data.supervisor_name,
      fyp_title: data.fyp_title,
      abstract: data.abstract,
      problem_statement: data.problem_statement,
      tech_stack: data.tech_stack,
      domain_tag_id: data.domain_tag_id as number,
      proposal_link:
        data.proposal_method === "link" ? data.proposal_link : undefined
    }

    const res = await submitRequest(spaceId, submitData, proposalFilePayload)

    if (res?.success) {
      toast({ title: "Advisor request submitted", duration: 3000 })
      onOpenChange(false)
      onSubmitted()
    } else {
      const message =
        typeof res?.error === "string" ? res.error : "Please try again later."

      if (res?.field === "domain_tag_id") {
        form.setError("domain_tag_id", { type: "manual", message })
      } else {
        toast({
          title: "Failed to submit request",
          description: message,
          variant: "destructive"
        })
      }
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Advisor</DialogTitle>
            <DialogDescription>
              Submit your project details so it can be routed to advisors in
              your domain.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[78vh] pr-3">
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <div className="flex flex-col gap-4">
                <SectionHeading step="01" title="Team & supervision" />

                <div className="flex flex-col gap-2">
                  <Label className="font-semibold">Group Members</Label>
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-start gap-2">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Controller
                            name={`group_members.${index}.name`}
                            control={control}
                            render={({ field }) => (
                              <Input placeholder="Full name" {...field} />
                            )}
                          />
                          <Controller
                            name={`group_members.${index}.registration_number`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                placeholder="Registration number"
                                {...field}
                              />
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          aria-label="Remove member"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() =>
                      append({ name: "", registration_number: "" })
                    }
                  >
                    + Add member
                  </Button>
                  {errors.group_members && (
                    <span className="text-red-500 text-sm">
                      {errors.group_members.message ||
                        errors.group_members.root?.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="supervisor_name" className="font-semibold">
                    University Supervisor Name
                  </Label>
                  <Controller
                    name="supervisor_name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="supervisor_name"
                        placeholder="Supervisor name"
                        {...field}
                      />
                    )}
                  />
                  {errors.supervisor_name && (
                    <span className="text-red-500 text-sm">
                      {errors.supervisor_name.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <SectionHeading step="02" title="Project details" />

                <div className="flex flex-col gap-2">
                  <Label htmlFor="fyp_title" className="font-semibold">
                    FYP Title
                  </Label>
                  <Controller
                    name="fyp_title"
                    control={control}
                    render={({ field }) => (
                      <Input id="fyp_title" placeholder="Title" {...field} />
                    )}
                  />
                  {errors.fyp_title && (
                    <span className="text-red-500 text-sm">
                      {errors.fyp_title.message}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="abstract" className="font-semibold">
                      Abstract
                    </Label>
                    <Controller
                      name="abstract"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          id="abstract"
                          rows={3}
                          placeholder="Briefly summarize your project"
                          {...field}
                        />
                      )}
                    />
                    {errors.abstract && (
                      <span className="text-red-500 text-sm">
                        {errors.abstract.message}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="problem_statement"
                      className="font-semibold"
                    >
                      Problem Statement
                    </Label>
                    <Controller
                      name="problem_statement"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          id="problem_statement"
                          rows={3}
                          placeholder="What problem does this project solve?"
                          {...field}
                        />
                      )}
                    />
                    {errors.problem_statement && (
                      <span className="text-red-500 text-sm">
                        {errors.problem_statement.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="tech_stack" className="font-semibold">
                      Tech Stack
                    </Label>
                    <Controller
                      name="tech_stack"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="tech_stack"
                          placeholder="e.g. Next.js, PostgreSQL, AWS"
                          {...field}
                        />
                      )}
                    />
                    {errors.tech_stack && (
                      <span className="text-red-500 text-sm">
                        {errors.tech_stack.message}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="font-semibold">Domain</Label>
                    <TagSelect
                      type="interest"
                      selected={selectedDomain}
                      setSelected={setSelectedDomain}
                      single
                      placeholder="Add a domain..."
                    />
                    {errors.domain_tag_id && (
                      <span className="text-red-500 text-sm">
                        {errors.domain_tag_id.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <SectionHeading step="03" title="Project proposal" />

                <div className="flex flex-col gap-2">
                  <Controller
                    name="proposal_method"
                    control={control}
                    render={({ field }) => (
                      <Tabs value={field.value} onValueChange={field.onChange}>
                        <TabsList>
                          <TabsTrigger value="file">Upload file</TabsTrigger>
                          <TabsTrigger value="link">Paste link</TabsTrigger>
                        </TabsList>
                        <TabsContent value="file">
                          <FileUpload
                            fileType="file"
                            accept={ADVISOR_REQUEST_PROPOSAL_ACCEPT}
                            multiple={false}
                            onChange={handleFileChange}
                            onRemove={() => setProposalFile(null)}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            PDF, DOC, or DOCX. Max size 200MB.
                          </p>
                        </TabsContent>
                        <TabsContent value="link">
                          <Controller
                            name="proposal_link"
                            control={control}
                            render={({ field }) => (
                              <Input placeholder="https://..." {...field} />
                            )}
                          />
                        </TabsContent>
                      </Tabs>
                    )}
                  />
                  {proposalMethod === "link" && errors.proposal_link && (
                    <span className="text-red-500 text-sm">
                      {errors.proposal_link.message}
                    </span>
                  )}
                </div>
              </div>

              <Separator />

              <DialogFooter>
                <Button type="submit" loading={submitting}>
                  Submit Request
                </Button>
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        showConfirmation={showConfirmation}
        setShowConfirmation={setShowConfirmation}
        setIsActualDialogOpen={() => onOpenChange(false)}
      />
    </>
  )
}

export default RequestAdvisorModal
