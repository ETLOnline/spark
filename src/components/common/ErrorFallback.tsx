"use client"

import React, { useEffect } from "react"
import { LinkAsButton } from "../LinkAsButton/LinkAsButton"
import Image from "next/image"
import { Button } from "../ui/button"

export default function ErrorFallback({
  error,
  reset
}: {
  error: Error
  reset: () => void
}) {
  useEffect(() => {
    console.error("Error caught by error boundary:", error)
  }, [error])

  return (
    <section className="bg-white dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="px-4 mx-auto max-w-screen-xl lg:px-6 w-full">
        <div className="mx-auto max-w-screen-sm text-center">
          <div className="flex justify-center">
            <Image
              src={"/images/errors/500.svg"}
              alt="Error occurred"
              width={300}
              height={300}
            />
          </div>
          <p className="mb-4 text-3xl tracking-tight font-semibold text-gray-900 dark:text-white">
            Oops! Something went wrong.
          </p>
          <p className="mb-4 text-sm font-light text-gray-500 dark:text-gray-400">
            {error.message || "An unexpected error has occurred."}
          </p>
          <div className="flex justify-center gap-4">
            <LinkAsButton href="/">Back to Homepage</LinkAsButton>
            <Button
              onClick={() => reset()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
