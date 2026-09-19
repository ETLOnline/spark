"use client"

import { Control, Controller } from "react-hook-form"
import { Button } from "@/src/components/ui/button"
import { Textarea } from "@/src/components/ui/textarea"
import { Checkbox } from "@/src/components/ui/checkbox"
import { cn } from "@/src/lib/utils"
import { FeedbackField } from "./constants"
import { RatingInput } from "./RatingInput"

export function FeedbackFieldRow({
  field,
  control,
  error
}: {
  field: FeedbackField
  control: Control<Record<string, number | string | string[]>>
  error?: string
}) {
  if (field.type === "rating" || field.type === "single_choice") {
    return (
      <div className="py-4 border-b last:border-0">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm flex-1">{field.question}</p>

          {field.type === "rating" && (
            <Controller
              name={field.key}
              control={control}
              render={({ field: { value, onChange } }) => (
                <RatingInput value={(value as number) ?? 0} onChange={onChange} />
              )}
            />
          )}

          {field.type === "single_choice" && (
            <Controller
              name={field.key}
              control={control}
              render={({ field: { value, onChange } }) => (
                <div className="flex flex-wrap justify-end gap-2 shrink-0">
                  {field.options?.map((opt) => (
                    <Button
                      key={opt}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onChange(opt)}
                      className={cn(
                        "cursor-pointer",
                        value === opt &&
                          "border-primary bg-primary/5 text-primary"
                      )}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              )}
            />
          )}
        </div>
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      </div>
    )
  }

  return (
    <div className="py-4 border-b last:border-0 space-y-3">
      <p className="text-sm">{field.question}</p>

      {field.type === "multi_choice" && (
        <Controller
          name={field.key}
          control={control}
          render={({ field: { value, onChange } }) => (
            <div className="flex flex-wrap gap-3">
              {field.options?.map((opt) => {
                const selected = ((value as string[]) ?? []).includes(opt)
                return (
                  <label
                    key={opt}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <Checkbox
                      checked={selected}
                      onCheckedChange={(checked) => {
                        const current = (value as string[]) ?? []
                        onChange(
                          checked
                            ? [...current, opt]
                            : current.filter((o) => o !== opt)
                        )
                      }}
                    />
                    {opt}
                  </label>
                )
              })}
            </div>
          )}
        />
      )}

      {field.type === "text" && (
        <Controller
          name={field.key}
          control={control}
          render={({ field: rhfField }) => (
            <Textarea
              rows={3}
              placeholder={field.placeholder}
              {...rhfField}
              value={(rhfField.value as string) ?? ""}
            />
          )}
        />
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
