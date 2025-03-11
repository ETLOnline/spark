"use client"

import { ArrowLeft, Edit, Edit3, Settings, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { SelectSpace } from "@/src/db/schema"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"
import { useEffect } from "react"
import CreateSpaceModal from "../../Spaces/CreateSpaceModal/CreateSpaceModal"
import { useServerAction } from "@/src/hooks/useServerAction"
import { DeleteSpaceAction } from "@/src/server-actions/Space/space"
import { AlertDialog } from "@radix-ui/react-alert-dialog"
import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/src/components/ui/alert-dialog"
import { channelStore } from "@/src/store/chennel/channelStore"

type ChannelDetailsProps = {
	fetchedSpaces: SelectSpace[]
}

export default function ChannelDetails({ fetchedSpaces }: ChannelDetailsProps) {
	const [spaces, setSpaces] = useAtom(spaceStore.spaces)
	const params = useParams()
	const searchParams = useSearchParams()
	const channelName = decodeURIComponent(params.channel_name as string)
	const router = useRouter();
	const [selectedSpace, setSelecteSpace] = useAtom(spaceStore.selectedSpace)
	const setSpaceFormModelVisibility = useSetAtom(spaceStore.spaceFormModelVisibility)
	const channel = useAtomValue(channelStore.channels)
	const [selectedChannel, setSelectedChannel] = useAtom(channelStore.selectedChannel)
	const setChannelFormModelVisibility = useSetAtom(
		channelStore.channelformModalVisibility
	)
	const [addDeleteSpaceLoading, addDeleteSpaceData, addDeleteSpaceError, deleteSpace] = useServerAction(DeleteSpaceAction)

	useEffect(() => {
		setSpaces(fetchedSpaces)
	}, [])

	// useEffect(() => {
	// 	setSpaces(fetchedSpaces)
	// }, [fetchedSpaces])

	function handleEditSpace(space: SelectSpace) {
		setSpaceFormModelVisibility(true)
		setSelecteSpace(space)
	}

	async function handleDeleteSpace(selectedSpace: SelectSpace) {
		const deletedSpace = await deleteSpace(selectedSpace)
		if (deletedSpace?.success) {
			setSpaces((spaces) =>
				spaces.filter((spaces) => spaces.id !== selectedSpace?.id)
			)

		}
	}

	return (
		<div className="flex min-h-screen flex-col">
			<header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
				<Link href="/channels" className="mr-2">
					<Button variant="ghost" size="icon">
						<ArrowLeft className="h-5 w-5" />
						<span className="sr-only">Back to Dashboard</span>
					</Button>
				</Link>
				<h1 className="text-lg font-semibold sm:text-xl">Channels</h1>
			</header>
			<div className="relative h-40 sm:h-56 w-full">
				<Image
					src="/images/channels/channel_sample_image.jpg"
					alt="Sample image"
					fill
					className="object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
				<div className="absolute bottom-0 left-0 p-4 sm:p-6">
					<h1 className="text-2xl sm:text-3xl font-bold ">
						{channelName}
					</h1>
				</div>
			</div>
			<main className="flex-1 p-4 sm:p-6">
				<div className="space-y-6">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<h2 className="text-xl font-bold">Spaces in {channelName}</h2>
						<CreateSpaceModal
							channelId={searchParams.get("channel_id") as string}
						/>
					</div>
					<div className="grid grid-cols-1 gap-6">
						{spaces.map((space) => (
							<div key={space.id} className="rounded-lg border bg-card p-4 flex flex-col sm:flex-row justify-between">
								<Link href={`./${params.channel_name}/spaces?space_id=${space.id}`}>
									<div className="flex items-center gap-3">
										<div className="relative h-10 w-10 overflow-hidden rounded-lg">
											<Image src="/images/home/session-image2.jpg" alt={space.space_name} fill className="object-cover" />
										</div>
										<div>
											<div className="font-medium">{space.space_name}</div>
											<div className="text-sm text-muted-foreground line-clamp-1">{space.description}</div>
										</div>
									</div>
								</Link>
								<div className="flex justify-end gap-2 mt-4">
									<Button size="sm" onClick={() => handleEditSpace(space)}>
										<Edit3 />
									</Button>
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button variant={"destructive"}>
												<Trash2 />
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>Are you sure?</AlertDialogTitle>
												<AlertDialogDescription>This action will permanently delete space.</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancel</AlertDialogCancel>
												<AlertDialogAction onClick={() => handleDeleteSpace(space)} loading={addDeleteSpaceLoading}>Delete</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
									<Link href={`./${params.channel_name}/spaces/settings`}>
										<Button size="sm">
											<Settings />
										</Button>
									</Link>
								</div>
							</div>
						))}
					</div>
				</div>
			</main >
		</div >
	)
}