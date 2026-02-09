"use client"

import { useState } from "react"
import Image from "next/image"
import { CardContent, CardFooter } from "../../ui/card"
import { SelectFilePost } from "@/src/db/schema"
import { Badge } from "../../ui/badge"
import PostInteractions from "./post-interactions"
import { Separator } from "@/src/components/ui/separator"
import PostCommentForm from "./post-comment-form"
import PostCommentsSection from "./post-comments-section"
import ImageLightbox from "@/src/components/common/LightBox"

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
      <CardContent>
        {post.category && (
          <Badge variant="outline" className="mb-2">
            {post.category}
          </Badge>
        )}
        <p className="text-lg pb-5">{post.content}</p>

        {/* Images */}
        {images.length > 0 && (
          <div
            className={`mt-4 grid gap-3 ${
              isSingle ? "grid-cols-1" : "grid-cols-2"
            }`}
          >
            {images.map((file, idx) => (
              <div
                key={`${post.id}-file-${idx}`}
                className={`overflow-hidden rounded-lg bg-gradient-to-r from-accent to-secondary ${
                  isSingle ? "w-full" : "w-full"
                } cursor-pointer`}
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex(idx)
                  setIsLightboxOpen(true)
                }}
              >
                <Image
                  src={file.file_path}
                  alt={`Post image ${idx + 1}`}
                  width={isSingle ? 1200 : 600}
                  height={isSingle ? 700 : 350}
                  className={`w-full object-cover transition-transform duration-300 hover:scale-105 ${
                    isSingle ? "max-h-[32rem]" : "h-56"
                  }`}
                  priority={isSingle}
                />
              </div>
            ))}
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
          {post.hashtags &&
            post.hashtags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                #{tag.name}
              </Badge>
            ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4">
        <PostInteractions
          postId={post.id}
          likes={post.likes}
          comments={post.comments}
          likers={post.postLikes}
          spaceId={spaceId}
        />
        <Separator />
        <PostCommentsSection comments={post.postComments || []} />
        <PostCommentForm
          postId={post.id}
          comments={post.comments}
          spaceId={spaceId}
        />
      </CardFooter>
    </>
  )
}

export default ImagePost
