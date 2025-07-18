"use client"

import { useEffect, useState } from "react"
import { Save } from "lucide-react"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Separator } from "@/src/components/ui/separator"
import { Button } from "@/src/components/ui/button"
import { Switch } from "@/src/components/ui/switch"
import { SelectFeature, SelectSpace } from "@/src/db/schema"
import { Controller, useForm } from "react-hook-form"
import { useServerAction } from "@/src/hooks/useServerAction"
import { attachSpaceFeaturesAction } from "@/src/server-actions/Feature/Feature"
import { toast } from "@/src/hooks/use-toast"
import { useAtom } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"

export default function SpaceSettings({
  space,
  featuresList
}: {
  space: SelectSpace
  featuresList: SelectFeature[]
}) {
  const [ssrSpace, setSsrSpace] = useState<SelectSpace>(space)
  const [currentSpace, setCurrentSpace] = useAtom(spaceStore.currentSpace)

  const [
    attachingSpaceFeatures,
    attachedState,
    attachSpaceFeaturesError,
    attachSpaceFeatures
  ] = useServerAction(attachSpaceFeaturesAction)

  const defaultValues: any = {}
  featuresList.forEach((feature) => {
    defaultValues[feature.feature_slug] = ssrSpace.features?.find(
      (sf) => sf.feature?.feature_slug === feature.feature_slug
    )
      ? true
      : false
  })

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: defaultValues
  })

  useEffect(() => {
    if (ssrSpace) {
      const updatedFormObject: any = {}
      featuresList.forEach((feature) => {
        updatedFormObject[feature.feature_slug] = ssrSpace.features?.find(
          (sf) => sf.feature?.feature_slug === feature.feature_slug
        )
          ? true
          : false
      })

      Object.keys(updatedFormObject).forEach((key) => {
        setValue(key, updatedFormObject[key])
      })
    }
  }, [ssrSpace.features])

  // Handle save settings
  const handleSaveSettings = async (data: any) => {
    const featureIds = Object.keys(data)
      .map((key) => {
        if (data[key] === true) {
          return featuresList.find((f) => f.feature_slug === key)?.id
        }
      })
      .filter((id) => id !== undefined)

    const updatedSpace = await attachSpaceFeatures(ssrSpace.id, featureIds)
    if (updatedSpace?.success && updatedSpace.data) {
      setSsrSpace(updatedSpace.data)
      setCurrentSpace(updatedSpace.data)
      toast({
        title: "Space Setting Saved",
        duration: 3000
      })
    }
  }

  return (
    <main className="flex-1 p-4 sm:p-6">
      <div className="mx-auto max-w-2xl">
        <Card className="overflow-hidden">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle>Space Settings ({ssrSpace.space_name})</CardTitle>
            <CardDescription>
              Configure which features are available in this space and manage
              its status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-4 sm:px-6">
            <form onSubmit={handleSubmit(handleSaveSettings)}>
              <div className="space-y-4">
                <h3 className="text-base font-medium">Features</h3>
                <div className="space-y-4">
                  {featuresList.map((feature, index) => (
                    <div key={index} className="flex flex-col gap-4">
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-0.5">
                          <Label
                            htmlFor={feature.feature_slug}
                            className="text-base"
                          >
                            {feature.feature_name}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {feature.feature_description}
                          </p>
                        </div>
                        <Controller
                          name={feature.feature_slug}
                          control={control}
                          render={({ field }) => (
                            <Switch
                              id={feature.feature_slug}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                      </div>
                      <Separator />
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-end pt-4">
                <Button
                  loading={attachingSpaceFeatures}
                  disabled={attachingSpaceFeatures}
                  type="submit"
                  className="w-full sm:w-auto text-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
            {/* Features Section */}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
