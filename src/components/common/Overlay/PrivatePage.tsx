import { Lock } from "lucide-react"
import Link from "next/link"
import { Button } from "../../ui/button"

type PrivatePageProps = {
  page: string
  pageHref: string
}

const PrivatePage: React.FC<PrivatePageProps> = ({ page, pageHref }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-background">
      <Lock className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold mb-2">Private {page}</h2>
      <p className="text-muted-foreground mb-6 max-w-sm">
        This {page} is private. You must be a member to view its content. Please
        request access or wait for an invitation.
      </p>
      <Link href={pageHref}>
        <Button>Go Back</Button>
      </Link>
    </div>
  )
}

export default PrivatePage
