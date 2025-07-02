import { AzureStorageAdapter } from "@/src/services/storage/Adapters/azure.adapter"

export async function GET(request: Request) {
  try {
    // Parse the URL from the request
    const { searchParams } = new URL(request.url)

    // Get the value of the 'text' query parameter
    const text = searchParams.get("message") // returns string | null

    const blob = await AzureStorageAdapter.uploadFile({
      fileBuffer: Buffer.from(text!),
      fileName: text + ".txt",
      mimeType: "text/plain",
      folderPath: "storage-check"
    })
    console.log("blob", blob)
    return new Response(
      JSON.stringify({ message: "Storage check successful" }),
      { status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Storage check failed", error: String(error) }),
      { status: 500 }
    )
  }
}
