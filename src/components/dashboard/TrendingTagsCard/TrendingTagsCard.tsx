import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { TrendingUp } from 'lucide-react'

const trendingTags = [
  { name: "AI", count: 1234 },
  { name: "MachineLearning", count: 987 },
  { name: "DataScience", count: 856 },
  { name: "WebDev", count: 743 },
  { name: "JavaScript", count: 621 },
]

export function TrendingTagsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2 h-4 w-4" />
          Trending Tags
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {trendingTags.map((tag) => (
            <Badge key={tag.name} variant="secondary" className="text-xs">
              #{tag.name}
              <span className="ml-1 text-muted-foreground">({tag.count})</span>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

