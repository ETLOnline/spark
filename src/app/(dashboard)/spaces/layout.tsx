import CategorySelection from "@/src/components/dashboard/Spaces/CategorySelection"
import SpacesStats from "@/src/components/dashboard/Spaces/SpacesStats"

const SpacesLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col space-y-4 w-full">
      <section className="flex space-x-4 w-full sticky pt-[8px] top-0 bg-background z-10 h-[128px]">
        <CategorySelection />
      </section>
      <div className="flex-grow flex justify-center items-start space-x-4">
        <main className="grow space-y-4 post-feed">{children}</main>
        <SpacesStats />
      </div>
    </div>
  )
}

export default SpacesLayout
