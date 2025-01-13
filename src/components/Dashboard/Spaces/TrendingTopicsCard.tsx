import { Card } from "../../ui/card"
import { CardHeader } from "../../ui/card"
import { CardTitle } from "../../ui/card"
import { CardContent } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { TrendingUp } from "lucide-react"
import { Topic } from "./types/spaces-types.d"

type TendingTopicProps = {
  topics: Topic[]
}

const TrendingTopicsCard: React.FC<TendingTopicProps> = (props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trending Topics</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {props.topics.map((topic: Topic, index) => (
            <li key={index} className="flex justify-between items-center">
              <span className="flex items-center">
                <TrendingUp className="mr-2 h-4 w-4 text-primary" />
                {topic.name}
              </span>
              <Badge variant="secondary">{topic.posts} posts</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default TrendingTopicsCard
