type PostTextProps = {
    content: string
}

const PostText:React.FC<PostTextProps> = (props) => {
    return (
        <p className="text-lg">{props.content}</p>
    );
};

export default PostText;