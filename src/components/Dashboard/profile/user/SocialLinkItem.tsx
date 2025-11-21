export const SocialLinkItem = ({ icon, label, url }: any) => {
  return (
    <a
      href={url}
      target="_blank"
      className="
        flex items-center gap-2 text-sm
        dark:text-muted-foreground
        text-sky-600
        hover:underline
        transition-colors
      "
    >
      {icon}
      <span>{label}</span>
    </a>
  )
}
