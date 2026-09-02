"use client"

import { useEffect, useState } from "react"
import { Save, CircleAlert } from "lucide-react"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Button } from "@/src/components/ui/button"
import { Switch } from "@/src/components/ui/switch"
import { SelectFeature, SelectSpace } from "@/src/db/schema"
import { Controller, useForm } from "react-hook-form"
import { useServerAction } from "@/src/hooks/useServerAction"
import { attachSpaceFeaturesAction } from "@/src/server-actions/Feature/Feature"
import { UpdateSpaceAction } from "@/src/server-actions/Space/Space"
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

  const isCommunityFypEnabled = !!ssrSpace.channel?.community?.is_FYP_enable

  const [
    attachingSpaceFeatures,
    attachedState,
    attachSpaceFeaturesError,
    attachSpaceFeatures
  ] = useServerAction(attachSpaceFeaturesAction)

  const [updatingSpace, , , updateSpaceFyp] = useServerAction(UpdateSpaceAction)

  const defaultValues: any = {
    is_FYP_enable: isCommunityFypEnabled && !!ssrSpace.is_FYP_enable
  }
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
      const updatedFormObject: any = {
        is_FYP_enable: isCommunityFypEnabled && !!ssrSpace.is_FYP_enable
      }
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
  }, [ssrSpace.features, ssrSpace.is_FYP_enable, isCommunityFypEnabled])

  // Handle save settings
  const handleSaveSettings = async (data: any) => {
    const featureIds = Object.keys(data)
      .map((key) => {
        if (key !== "is_FYP_enable" && data[key] === true) {
          return featuresList.find((f) => f.feature_slug === key)?.id
        }
      })
      .filter((id) => id !== undefined)

    const updatedSpace = await attachSpaceFeatures(ssrSpace.id, featureIds)
    if (!updatedSpace?.success || !updatedSpace.data) return

    const isFypEnabled = isCommunityFypEnabled && !!data.is_FYP_enable
    let finalSpace = updatedSpace.data

    if (isFypEnabled !== !!finalSpace.is_FYP_enable) {
      const fypUpdatedSpace = await updateSpaceFyp(ssrSpace.id, {
        is_FYP_enable: isFypEnabled
      })
      if (fypUpdatedSpace?.success && fypUpdatedSpace.data) {
        finalSpace = { ...finalSpace, ...fypUpdatedSpace.data }
      }
    }

    setSsrSpace(finalSpace)
    setCurrentSpace(finalSpace)
    toast({
      title: "Space Setting Saved",
      duration: 3000
    })
  }

  const rows: Array<{
    key: string
    name: string
    description: string
    disabled?: boolean
    disabledMessage?: string
  }> = [
    ...featuresList.map((feature) => ({
      key: feature.feature_slug,
      name: feature.feature_name,
      description: feature.feature_description || ""
    })),
    {
      key: "is_FYP_enable",
      name: "Enable FYP",
      description: "Enable or disable FYP feature to request advisor.",
      disabled: !isCommunityFypEnabled,
      disabledMessage: "FYP feature is disabled by the community admin"
    }
  ]

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
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit(handleSaveSettings)}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Features
              </h3>
              <div className="mt-2 divide-y">
                {rows.map((row) => (
                  <div key={row.key} className="flex flex-col gap-2 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <Label htmlFor={row.key} className="text-base">
                          {row.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {row.description}
                        </p>
                      </div>
                      <Controller
                        name={row.key}
                        control={control}
                        render={({ field }) => (
                          <Switch
                            id={row.key}
                            checked={row.disabled ? false : !!field.value}
                            onCheckedChange={field.onChange}
                            disabled={row.disabled}
                          />
                        )}
                      />
                    </div>
                    {row.disabled && row.disabledMessage && (
                      <div className="flex items-center gap-1.5 text-sm text-amber-500">
                        <CircleAlert className="h-4 w-4" />
                        <span>{row.disabledMessage}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <CardFooter className="justify-end border-t px-0 py-4">
                <Button
                  loading={attachingSpaceFeatures || updatingSpace}
                  disabled={attachingSpaceFeatures || updatingSpace}
                  type="submit"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
