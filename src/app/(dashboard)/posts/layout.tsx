import { PlatformSuggestionCard } from '@/src/components/Dashboard/PlatformSuggestionCard/PlatformSuggestionCard'
import { TrendingTagsCard } from '@/src/components/Dashboard/TrendingTagsCard/TrendingTagsCard'
import { Separator } from '@/src/components/ui/separator'
import React, { ReactNode } from 'react'

const PostFeedLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex border-t">
      <div className="flex-1 overflow-auto">
        {children}
      </div>
      <div className="hidden w-80 flex-shrink-0 border-l lg:block">
        <div className="p-4">
          <TrendingTagsCard />
          <Separator className="my-4" />
          <PlatformSuggestionCard />
        </div>
      </div>
    </div>
  )
}

export default PostFeedLayout