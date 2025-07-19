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
import { desc } from "drizzle-orm"
import { set, z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import moment from "moment"

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
  title: z.string().min(1, "Required"),
  institute: z.string().min(1, "Required"),
  year: z.string().refine((val) => moment(val, "YYYY", true).isValid(), {
    message: "Invalid year"
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

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
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
                  <Input id="year" placeholder="2024" {...field} />
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

            <Button
              loading={createCertificateLoading || updateCertificateLoading}
            >
              {selectedCertificate ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CertificateModal
