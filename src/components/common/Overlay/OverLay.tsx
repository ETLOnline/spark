import { Lock } from "lucide-react"
import Link from "next/link"
import { Button } from "../../ui/button"

type OverLayProps = {
  page: string
  pageHref: string
}

const Overlay: React.FC<OverLayProps> = ({ page, pageHref }) => {
  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 text-center">
      <Lock className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold mb-2">Private {page}</h2>
      <p className="text-muted-foreground mb-6 max-w-sm">
        This {page} is private. You must be a member to view its content. Please
        request access or wait for an invitation.
      </p>
      {/* You can add a button here for requesting access if that's a feature */}
      <Link href={pageHref}>
        <Button>Go Back</Button>
      </Link>
    </div>
  )
}

export default Overlay
