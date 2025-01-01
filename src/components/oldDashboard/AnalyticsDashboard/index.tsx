'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart"
import { ResponsiveBar } from "@nivo/bar"
import { ResponsiveLine } from "@nivo/line"
import { ResponsivePie } from "@nivo/pie"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Progress } from "@/src/components/ui/progress"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { ArrowDown, ArrowUp, Users, Briefcase, Star, Zap, TrendingUp } from 'lucide-react'

// Sample data for the charts
const userGrowthData = [
  { x: "Jan", y: 100 },
  { x: "Feb", y: 120 },
  { x: "Mar", y: 135 },
  { x: "Apr", y: 150 },
  { x: "May", y: 180 },
  { x: "Jun", y: 210 }
]

const projectStatusData = [
  { id: "Active", value: 45 },
  { id: "Completed", value: 30 },
  { id: "Draft", value: 25 }
]

const engagementData = [
  { month: "Jan", "Active Users": 80, "New Sign-ups": 20 },
  { month: "Feb", "Active Users": 90, "New Sign-ups": 25 },
  { month: "Mar", "Active Users": 95, "New Sign-ups": 30 },
  { month: "Apr", "Active Users": 100, "New Sign-ups": 35 },
  { month: "May", "Active Users": 110, "New Sign-ups": 40 },
  { month: "Jun", "Active Users": 120, "New Sign-ups": 45 }
]

const topUsers = [
  { name: "Alice Johnson", avatar: "/avatars/01.png", contributions: 120, projects: 5 },
  { name: "Bob Smith", avatar: "/avatars/02.png", contributions: 95, projects: 4 },
  { name: "Charlie Davis", avatar: "/avatars/03.png", contributions: 85, projects: 3 },
  { name: "Diana Miller", avatar: "/avatars/04.png", contributions: 75, projects: 3 },
  { name: "Edward Wilson", avatar: "/avatars/05.png", contributions: 70, projects: 2 }
]

const topProjects = [
  { name: "AI Code Assistant", category: "AI & Development", contributors: 15, progress: 75 },
  { name: "Eco Smart Home", category: "IoT & Sustainability", contributors: 12, progress: 60 },
  { name: "Decentralized Learning", category: "Blockchain & Education", contributors: 10, progress: 45 },
  { name: "Health Monitor App", category: "Mobile Apps", contributors: 8, progress: 80 },
  { name: "Cybersecurity Toolkit", category: "Cybersecurity", contributors: 7, progress: 30 }
]

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("7d")

  return (
    <div className="h-full p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,500</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">+2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Engagement</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={{
              line1: {
                label: "Users",
                color: "hsl(var(--chart-1))",
              },
            }}>
              <>
                <ResponsiveLine
                  data={[
                    {
                      id: "Users",
                      data: userGrowthData
                    }
                  ]}
                  margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                  xScale={{ type: 'point' }}
                  yScale={{
                    type: 'linear',
                    min: 'auto',
                    max: 'auto',
                    stacked: true,
                    reverse: false
                  }}
                  yFormat=" >-.2f"
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Month',
                    legendOffset: 36,
                    legendPosition: 'middle'
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Users',
                    legendOffset: -40,
                    legendPosition: 'middle'
                  }}
                  pointSize={10}
                  pointColor={{ theme: 'background' }}
                  pointBorderWidth={2}
                  pointBorderColor={{ from: 'serieColor' }}
                  pointLabelYOffset={-12}
                  useMesh={true}
                  legends={[
                    {
                      anchor: 'bottom-right',
                      direction: 'column',
                      justify: false,
                      translateX: 100,
                      translateY: 0,
                      itemsSpacing: 0,
                      itemDirection: 'left-to-right',
                      itemWidth: 80,
                      itemHeight: 20,
                      itemOpacity: 0.75,
                      symbolSize: 12,
                      symbolShape: 'circle',
                      symbolBorderColor: 'rgba(0, 0, 0, .5)',
                      effects: [
                        {
                          on: 'hover',
                          style: {
                            itemBackground: 'rgba(0, 0, 0, .03)',
                            itemOpacity: 1
                          }
                        }
                      ]
                    }
                  ]}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={{
              pie1: {
                label: "Status",
                color: "hsl(var(--chart-1))",
              },
            }}>
              <>
								<ResponsivePie
									data={projectStatusData}
									margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
									innerRadius={0.5}
									padAngle={0.7}
									cornerRadius={3}
									activeOuterRadiusOffset={8}
									borderWidth={1}
									borderColor={{
										from: 'color',
										modifiers: [
											[
												'darker',
												0.2
											]
										]
									}}
									arcLinkLabelsSkipAngle={10}
									arcLinkLabelsTextColor="hsl(var(--foreground))"
									arcLinkLabelsThickness={2}
									arcLinkLabelsColor={{ from: 'color' }}
									arcLabelsSkipAngle={10}
									arcLabelsTextColor={{
										from: 'color',
										modifiers: [
											[
												'darker',
												2
											]
										]
									}}
									defs={[
										{
											id: 'dots',
											type: 'patternDots',
											background: 'inherit',
											color: 'rgba(255, 255, 255, 0.3)',
											size: 4,
											padding: 1,
											stagger: true
										},
										{
											id: 'lines',
											type: 'patternLines',
											background: 'inherit',
											color: 'rgba(255, 255, 255, 0.3)',
											rotation: -45,
											lineWidth: 6,
											spacing: 10
										}
									]}
									fill={[
										{
											match: {
												id: 'Active'
											},
											id: 'dots'
										},
										{
											match: {
												id: 'Completed'
											},
											id: 'lines'
										}
									]}
									legends={[
										{
											anchor: 'bottom',
											direction: 'row',
											justify: false,
											translateX: 0,
											translateY: 56,
											itemsSpacing: 0,
											itemWidth: 100,
											itemHeight: 18,
											itemTextColor: '#999',
											itemDirection: 'left-to-right',
											itemOpacity: 1,
											symbolSize: 18,
											symbolShape: 'circle',
											effects: [
												{
													on: 'hover',
													style: {
														itemTextColor: 'hsl(var(--foreground))'
													}
												}
											]
										}
									]}
								/>
								<ChartTooltip content={<ChartTooltipContent />} />
							</>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={{
              bar1: {
                label: "Active Users",
                color: "hsl(var(--chart-1))",
              },
              bar2: {
                label: "New Sign-ups",
                color: "hsl(var(--chart-2))",
              },
            }}>
							<>
								<ResponsiveBar
									data={engagementData}
									keys={['Active Users', 'New Sign-ups']}
									indexBy="month"
									margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
									padding={0.3}
									valueScale={{ type: 'linear' }}
									indexScale={{ type: 'band', round: true }}
									colors={['hsl(var(--chart-1))', 'hsl(var(--chart-2))']}
									defs={[
										{
											id: 'dots',
											type: 'patternDots',
											background: 'inherit',
											color: '#38bcb2',
											size: 4,
											padding: 1,
											stagger: true
										},
										{
											id: 'lines',
											type: 'patternLines',
											background: 'inherit',
											color: '#eed312',
											rotation: -45,
											lineWidth: 6,
											spacing: 10
										}
									]}
									fill={[
										{
											match: {
												id: 'Active Users'
											},
											id: 'dots'
										},
										{
											match: {
												id: 'New Sign-ups'
											},
											id: 'lines'
										}
									]}
									borderColor={{
										from: 'color',
										modifiers: [['darker', 1.6]]
									}}
									axisTop={null}
									axisRight={null}
									axisBottom={{
										tickSize: 5,
										tickPadding: 5,
										tickRotation: 0,
										legend: 'Month',
										legendPosition: 'middle',
										legendOffset: 32
									}}
									axisLeft={{
										tickSize: 5,
										tickPadding: 5,
										tickRotation: 0,
										legend: 'Count',
										legendPosition: 'middle',
										legendOffset: -40
									}}
									labelSkipWidth={12}
									labelSkipHeight={12}
									labelTextColor={{
										from: 'color',
										modifiers: [['darker', 1.6]]
									}}
									legends={[
										{
											dataFrom: 'keys',
											anchor: 'bottom-right',
											direction: 'column',
											justify: false,
											translateX: 120,
											translateY: 0,
											itemsSpacing: 2,
											itemWidth: 100,
											itemHeight: 20,
											itemDirection: 'left-to-right',
											itemOpacity: 0.85,
											symbolSize: 20,
											effects: [
												{
													on: 'hover',
													style: {
														itemOpacity: 1
													}
												}
											]
										}
									]}
									role="application"
									ariaLabel="User Engagement Chart"
									barAriaLabel={e=>e.id+": "+e.formattedValue+" in month: "+e.indexValue}
								/>
								<ChartTooltip content={<ChartTooltipContent />} />
							</>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Users</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {topUsers.map((user, index) => (
                <div key={index} className="mb-4 flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.contributions} contributions, {user.projects} projects
                    </p>
                  </div>
                  <TrendingUp className="ml-auto h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Top Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {topProjects.map((project, index) => (
                <div key={index} className="mb-4">
                  <div className="mb-2 flex items-center">
                    <span className="text-2xl font-bold">{index + 1}</span>
                    <div className="ml-4">
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">{project.category}</p>
                    </div>
                    <div className="ml-auto font-medium">{project.contributors} contributors</div>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                  <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      New project created
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {`${30 - i} minutes ago`}
                    </p>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

