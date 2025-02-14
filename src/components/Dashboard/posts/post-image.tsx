import Image from "next/image"

type Props = {
  postImg: string
}

const ImagePost: React.FC<Props> = ({ postImg }) => {
  return (
    <Image
      src={postImg}
      alt="Post image"
      className="rounded-lg max-h-96 w-full object-cover"
      width={1000}
      height={1000}
    />
  )
}

export default ImagePost
