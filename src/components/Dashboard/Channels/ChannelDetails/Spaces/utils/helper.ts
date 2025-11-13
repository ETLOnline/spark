export function getUniqueFileName(
  originalName: string,
  existingNames: string[]
) {
  const dotIndex = originalName.lastIndexOf(".")
  const baseName =
    dotIndex !== -1 ? originalName.slice(0, dotIndex) : originalName
  const extension = dotIndex !== -1 ? originalName.slice(dotIndex) : ""

  let counter = 1
  let newName = originalName.toLowerCase()

  while (existingNames.includes(newName)) {
    newName = `${baseName}(${counter})${extension}`.toLowerCase()
    counter++
  }

  return newName
}
