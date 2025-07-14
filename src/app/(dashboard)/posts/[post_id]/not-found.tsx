import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { ArrowLeft } from "lucide-react"

const NotFoundPage = () => {
  return (
    <div className="container mx-auto py-16 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The post you're looking for doesn't exist or has been deleted.
        </p>
        <Button asChild>
          <Link href="/posts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Posts
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default NotFoundPage
