"use client"

import { Card } from "../../ui/card"
import { CardHeader } from "../../ui/card"
import { CardTitle } from "../../ui/card"
import { CardContent } from "../../ui/card"
import { ScrollArea } from "../../ui/scroll-area"
import { ScrollBar } from "../../ui/scroll-area"
import { Button } from "../../ui/button"
import { useState } from "react"

const CategorySelection = () => {
  const [categories, setCategories] = useState([
    "All",
    "Programming",
    "AI & Machine Learning",
    "Open Source",
    "Web Development",
    "Mobile Development",
    "Data Science",
    "DevOps",
    "Cybersecurity",
    "Blockchain",
    "IoT"
  ])
  const [activeCategory, setActiveCategory] = useState("All")

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full overflow-auto pb-3">
          <div className="flex w-[100px] space-x-2 p-1">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category)}
                className="flex-shrink-0"
              >
                {category}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default CategorySelection
