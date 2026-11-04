"use client"
import PostAiTags from "./post-ai-tags"
import PostFooter from "./post-footer"

import { useState } from "react"
import Image from "next/image"
import { CardContent } from "../../ui/card"
import { SelectFilePost } from "@/src/db/schema"
import { Badge } from "../../ui/badge"
import ImageLightbox from "@/src/components/common/LightBox"
import ExpandableText from "./ExpandableText"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from "@/src/components/ui/carousel"

type Props = {
  post: SelectFilePost
  spaceId?: string
}

const ImagePost: React.FC<Props> = ({ post, spaceId }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const images = post.files?.length
    ? post.files
    : post.file?.file_path
      ? [{ file_path: post.file.file_path }]
      : []

  const imageUrls = images.map((f) => f.file_path)

  const isSingle = images.length === 1

  return (
    <>
      <CardContent className="p-0">
        {post.category && (
          <Badge variant="outline" className="mb-2">
            {post.category}
          </Badge>
        )}
        {post.content && (
          <ExpandableText content={post?.content} lines={6} isHtml />
        )}

        {/* Images */}
        {images.length > 0 && (
          <div className="mt-4">
            {isSingle ? (
              <div
                className="w-full cursor-pointer overflow-hidden rounded-lg bg-background"
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex(0)
                  setIsLightboxOpen(true)
                }}
              >
                <Image
                  src={images[0].file_path}
                  alt="Post image 1"
                  width={1200}
                  height={700}
                  className="h-96 w-full object-contain transition-transform duration-300 hover:scale-105"
                  priority
                />
              </div>
            ) : (
              <Carousel className="w-full" opts={{ loop: true }}>
                <CarouselContent>
                  {images.map((file, idx) => (
                    <CarouselItem
                      key={`${post.id}-file-${idx}`}
                      className="basis-full"
                    >
                      <div
                        className="cursor-pointer overflow-hidden rounded-lg bg-background"
                        onClick={(e) => {
                          e.stopPropagation()
                          setLightboxIndex(idx)
                          setIsLightboxOpen(true)
                        }}
                      >
                        <Image
                          src={file.file_path}
                          alt={`Post image ${idx + 1}`}
                          width={1200}
                          height={700}
                          className="h-96 w-full object-contain"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            )}
            {imageUrls.length > 0 && (
              <ImageLightbox
                open={isLightboxOpen}
                images={imageUrls}
                index={lightboxIndex}
                onClose={() => setIsLightboxOpen(false)}
              />
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <PostAiTags tags={post.ai_tags} />
          {post.hashtags &&
            post.hashtags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                #{tag.name}
              </Badge>
            ))}
        </div>
      </CardContent>
      <PostFooter post={post} spaceId={spaceId} />
    </>
  )
}

export default ImagePost
