import Image from "next/image"

type PostImageProps = {
  content: string
}

const PostImage: React.FC<PostImageProps> = (props) => {
  return (
    <Image
      src={props.content}
      alt="Post image"
      className="rounded-lg max-h-96 w-full object-cover"
      width={1000}
      height={1000}
    />
  )
}

export default PostImage
