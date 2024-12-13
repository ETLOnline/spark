import { Card, CardTitle, CardHeader, CardContent } from "../../ui/card"
import { Stat } from "./types/spaces"

type CommunityStatsProps = {
  stats: Stat[]
}

const CommunityStats: React.FC<CommunityStatsProps> = (props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {props.stats.map((stat: Stat) => (
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                {stat.icon}
                {stat.name}
              </span>
              <span className="font-bold">{stat.amount}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default CommunityStats