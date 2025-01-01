import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Users } from 'lucide-react'

const suggestions = [
  { name: "Alice Johnson", avatar: "/avatars/01.png", role: "AI Researcher" },
  { name: "Bob Smith", avatar: "/avatars/02.png", role: "Data Scientist" },
  { name: "Carol Williams", avatar: "/avatars/03.png", role: "Web Developer" },
]

export function PlatformSuggestionCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-4 w-4" />
          Suggested Connections
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div key={suggestion.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={suggestion.avatar} alt={suggestion.name} />
                  <AvatarFallback>{suggestion.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{suggestion.name}</p>
                  <p className="text-xs text-muted-foreground">{suggestion.role}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Connect
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

