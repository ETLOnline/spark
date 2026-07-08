import React, {
  Dispatch,
  SetStateAction,
  use,
  useEffect,
  useState
} from "react"
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
import { Plus } from "lucide-react"
import { Label } from "../../ui/label"
import { Controller, useForm } from "react-hook-form"
import { Input } from "../../ui/input"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  CreateCertificateAction,
  DeleteCertificateAction,
  UpdateCertificateAction
} from "@/src/server-actions/Certificates/certificate"
import { SelectCertificate } from "@/src/db/schema"
import { toast } from "@/src/hooks/use-toast"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import moment from "moment"
import { UnsavedChangesDialog } from "../../common/unsavedChangesDialog"
import { useConfirmClose } from "@/src/hooks/useConfirmClose"

interface Props {
  UserId: string
  certificates: SelectCertificate[] | undefined
  setCertificates: Dispatch<SetStateAction<SelectCertificate[] | undefined>>
  isDialogOpen: boolean
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>
  selectedCertificate: SelectCertificate | null
  setSelectedCertificate: Dispatch<SetStateAction<SelectCertificate | null>>
}

const userCertificateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Certificate name cannot be empty")
    .max(100, "Certificate name cannot exceed 100 characters"),

  institute: z
    .string()
    .trim()
    .min(1, "Institute name cannot be empty")
    .max(100, "Institute name cannot exceed 100 characters"),

  year: z
    .string()
    .min(1, "Year is required")
    .refine((val) => moment(val, "YYYY", true).isValid(), {
      message: "Invalid year format"
    })
    .refine((val) => moment(val, "YYYY", true).year() >= 1990, {
      message: "Year must be 1990 or later"
    })
    .refine((val) => moment(val, "YYYY", true).year() <= moment().year(), {
      message: "Year cannot be in the future"
    })
})

const CertificateModal = ({
  UserId,
  certificates,
  setCertificates,
  isDialogOpen,
  setIsDialogOpen,
  selectedCertificate,
  setSelectedCertificate
}: Props) => {
  const [createCertificateLoading, , , CreateCertificate] = useServerAction(
    CreateCertificateAction
  )
  const [updateCertificateLoading, , , UpdateCertificate] = useServerAction(
    UpdateCertificateAction
  )
  const [DeleteCertificateLoading, , , DeleteCertificate] = useServerAction(
    DeleteCertificateAction
  )

  const form = useForm({
    resolver: zodResolver(userCertificateSchema)
  })

  const error = form.formState.errors
  const isChanged = form.formState.isDirty

  useEffect(() => {
    if (!isDialogOpen) {
      form.reset({
        title: "",
        institute: "",
        year: ""
      })
      setSelectedCertificate(null)
    }
  }, [isDialogOpen])

  useEffect(() => {
    if (selectedCertificate) {
      form.setValue("title", selectedCertificate?.title || "")
      form.setValue("institute", selectedCertificate.institute || "")
      form.setValue("year", selectedCertificate.year || "")
    }
  }, [selectedCertificate])

  const submitData = async (data: any) => {
    if (selectedCertificate) {
      HandleUpdateCertificate(data)
    } else {
      const payLoad = {
        ...data,
        user_id: UserId,
        title: data.title,
        institue: data.institue,
        year: data.year
      }
      HandleCreateCertificarte(payLoad)
    }
  }

  const HandleCreateCertificarte = async (data: SelectCertificate) => {
    try {
      const payLoad = {
        ...data,
        user_id: UserId
      }
      const response = await CreateCertificate(payLoad)
      if (response?.success && response.data) {
        setCertificates((pre) => pre && [...pre, response.data])
        setIsDialogOpen(false)
        toast({
          title: "Certificate Added",
          description: "Certificate Added Successfully",
          duration: 3000
        })
      }
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        duration: 3000,
        variant: "destructive"
      })
    }
  }

  const HandleUpdateCertificate = async (data: SelectCertificate) => {
    try {
      if (selectedCertificate?.id) {
        const res = await UpdateCertificate(selectedCertificate?.id, data)

        if (res?.success && res.data) {
          setCertificates(
            (pre) =>
              pre &&
              pre.map((c) => (c.id === selectedCertificate?.id ? res.data : c))
          )
          setIsDialogOpen(false)
          setSelectedCertificate(null)
          toast({
            title: "Certificate Updated",
            description: "Certificate Updated Successfully",
            duration: 3000
          })
        }
      }
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        duration: 3000,
        variant: "destructive"
      })
    }
  }

  const handleDeleteCertificate = async (id: number) => {
    try {
      const res = await DeleteCertificate(id)

      if (res?.success) {
        setCertificates((pre) => pre && pre.filter((c) => c.id !== id))
        setIsDialogOpen(false)
        setSelectedCertificate(null)
        toast({
          title: "Certificate Deleted",
          description: "Certificate Deleted Successfully",
          duration: 3000
        })
      }
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        duration: 3000,
        variant: "destructive"
      })
    }
  }

  const { showConfirmation, setShowConfirmation, handleClose } =
    useConfirmClose({
      isDirty: isChanged,
      onClose: () => setIsDialogOpen(false)
    })

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={handleClose}>
        <DialogContent
          className="sm:max-w-[425px]"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {selectedCertificate
                ? "Update Certificate and Qualification"
                : "Add Qualification & Certificate"}
            </DialogTitle>
            <DialogDescription>
              {selectedCertificate
                ? "Update your Certificate and Qualification to your profile."
                : "Add your Qualification and Certificate to your profile."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(submitData)}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor={`degree`} className="font-semibold">
                  Certificate
                </Label>
                <Controller
                  name="title"
                  defaultValue=""
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="title"
                      placeholder="e.g. Meta Full Stack Developer Certificate"
                      {...field}
                    />
                  )}
                />
                {error.title && (
                  <span className="text-red-500 text-sm">
                    {String(error.title.message)}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`institute`} className="font-semibold">
                  Institution
                </Label>
                <Controller
                  name="institute"
                  defaultValue=""
                  control={form.control}
                  render={({ field }) => (
                    <Input id="institute" placeholder="e.g. Meta" {...field} />
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
                  Year
                </Label>
                <Controller
                  name="year"
                  defaultValue=""
                  control={form.control}
                  render={({ field }) => (
                    <Input id="year" placeholder="e.g. 2024" {...field} />
                  )}
                />
                {error.year && (
                  <span className="text-red-500 text-sm">
                    {String(error.year.message)}
                  </span>
                )}
              </div>
            </div>
            <DialogFooter>
              {selectedCertificate ? (
                <Button
                  variant="outline"
                  loading={DeleteCertificateLoading}
                  onClick={() =>
                    handleDeleteCertificate(selectedCertificate?.id || 0)
                  }
                  type="button"
                >
                  Delete
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => handleClose(false)}
                  type="button"
                >
                  Cancel
                </Button>
              )}

              <Button
                loading={createCertificateLoading || updateCertificateLoading}
              >
                {selectedCertificate ? "Update" : "Add"}
              </Button>
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

export default CertificateModal
