import { Card, CardContent } from "@/src/components/ui/card"

export function EventAbout({ description }: { description: string }) {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">About This Event</h3>
        <div className="text-sm  space-y-3">
          <p>{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
