"use client"

import ErrorFallback from "../components/common/ErrorFallback"

export default function RootErrorBoundary({
  error,
  reset
}: {
  error: Error
  reset: () => void
}) {
  console.log(error, "eroor.ssss")
  return <ErrorFallback error={error} reset={reset} />
}
