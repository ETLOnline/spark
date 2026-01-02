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
import { Ban, FlameKindling, Plus, Star } from "lucide-react"
import { Label } from "../../ui/label"
import { Controller, useForm } from "react-hook-form"
import { Textarea } from "../../ui/textarea"
import { useServerAction } from "@/src/hooks/useServerAction"
import { AddRecommendationAction } from "@/src/server-actions/Recommendation/recommendation"
import { SelectRecommendation } from "@/src/db/schema"
import { toast } from "@/src/hooks/use-toast"
import NoDataCard from "../Channels/ChannelDetails/NoDataCard"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

interface RecommendationsModalProps {
  userId: string
  authUserId: string | undefined
  recommendations: SelectRecommendation[]
  setRecommendations: Dispatch<SetStateAction<SelectRecommendation[]>>
  setAverageRating: Dispatch<SetStateAction<string | null | undefined>>
}

const recommendationSchema = z.object({
  recommendation: z.string().optional(),
  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot be more than 5")
})

function RecommendationsModal({
  userId,
  authUserId,
  recommendations,
  setRecommendations,
  setAverageRating
}: RecommendationsModalProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)

  const [recommendationLoading, , , AddRecommendation] = useServerAction(
    AddRecommendationAction
  )

  const form = useForm({
    resolver: zodResolver(recommendationSchema)
  })

  const isRecommended = recommendations.some(
    (rec) => rec.recommender_id === authUserId
  )

  useEffect(() => {
    if (!isDialogOpen) {
      form.reset({
        recommendation: "",
        rating: 0
      })
    }
  }, [isDialogOpen])

  const onSubmit = async (data: any) => {
    try {
      const recommendation = {
        ...data,
        recommender_id: authUserId,
        receiver_id: userId,
        content: data.recommendation,
        rating: data.rating > 0 ? data.rating : 5
      }
      const res = await AddRecommendation(recommendation)
      if (res?.success && res?.data) {
        setRecommendations([
          ...recommendations,
          res.data.recommendation as SelectRecommendation
        ])
        setAverageRating(res?.data?.profile?.total_average_rating || "0")
        setIsDialogOpen(false)
        toast({
          title: "Recommendation added!",
          description: "Your recommendation has been successfully added.",
          duration: 3000
        })
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong",
        duration: 3000
      })
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size={"sm"} variant={"outline"}>
          <Plus className=" h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{"Add a Recommendation"}</DialogTitle>
          <DialogDescription>
            {
              " Write a few words about this person and your experience with them."
            }
          </DialogDescription>
        </DialogHeader>
        {isRecommended ? (
          <NoDataCard
            title="You have already recommended this user"
            icon={<Ban className="h-10 w-10" />}
          />
        ) : (
          <>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 py-4">
                <Label htmlFor="rating" className="font-semibold">
                  Kindle Sticks
                </Label>
                <div>
                  <div className="flex flex-row gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Controller
                        key={index + 1}
                        name="rating"
                        control={form.control}
                        defaultValue={0}
                        render={({ field: { value, onChange } }) => (
                          <FlameKindling
                            key={index + 1}
                            onMouseEnter={() => setHovered(index + 1)}
                            onMouseLeave={() => setHovered(null)}
                            onClick={() => onChange(index + 1)}
                            className={`w-10 h-10 cursor-pointer transition-colors ${(hovered ?? value) >= index + 1 ? "text-[#92400e] fill-[#fde68a]" : "fill-none"}`}
                            strokeWidth={1.5}
                          />
                        )}
                      />
                    ))}
                  </div>
                  <div>
                    {form.formState.errors.rating && (
                      <span className="text-red-500 text-sm">
                        {String(form.formState.errors.rating.message)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor={`degree`} className="font-semibold">
                    Recommendation
                  </Label>
                  <Controller
                    name="recommendation"
                    defaultValue=""
                    control={form.control}
                    render={({ field }) => (
                      <Textarea
                        id="recommendation"
                        rows={4}
                        placeholder="Recommendation...."
                        {...field}
                      />
                    )}
                  />
                  {/* {error.title && (
                <span className="text-red-500 text-sm">
                  {String(error.title.message)}
                </span>
              )} */}
                </div>
              </div>
              <DialogFooter>
                {/* <Button>
              Delete
            </Button> */}

                <Button loading={recommendationLoading}>{"Add"}</Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default RecommendationsModal
