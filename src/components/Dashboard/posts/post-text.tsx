type Props = {
  postText: string
}

const TextPost: React.FC<Props> = ({ postText }) => {
  return <p className="text-lg">{postText}</p>
}

export default TextPost
