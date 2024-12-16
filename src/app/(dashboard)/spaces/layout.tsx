import CategorySelection from "@/src/components/dashboard/Spaces/category-selection"
import SpacesStats from "@/src/components/dashboard/Spaces/spaces-stats"

const SpacesLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col space-y-4 w-full">
      <section className="flex space-x-4 w-full">
        <CategorySelection />
      </section>
      <div className="flex-grow flex space-x-4">
        <main className="w-3/4 space-y-4 post-feed">{children}</main>
        <SpacesStats />
      </div>
    </div>
  )
}

export default SpacesLayout
