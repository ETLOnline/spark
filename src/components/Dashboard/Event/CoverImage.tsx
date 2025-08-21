"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Upload, X } from "lucide-react"

interface ImageUploadProps {
  value?: string | null
  onChange?: (url: string | null) => void
  onBlur?: () => void
  disabled?: boolean
  name?: string
  className?: string
  id: string
}

export default function ImageUpload({
  value,
  onChange,
  onBlur,
  disabled,
  name,
  className
}: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      // In a real app, you'd upload the file to a server and get back a URL
      onChange?.(url)
    }
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    onChange?.(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleButtonClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        onBlur={onBlur}
        disabled={disabled}
        className="hidden"
      />

      {!previewUrl ? (
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          disabled={disabled}
          className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center justify-center gap-2 bg-transparent"
        >
          <Upload className="h-8 w-8 text-gray-400" />
          <span className="text-sm text-gray-600">Click to upload image</span>
          <span className="text-xs text-gray-400">
            PNG, JPG, GIF up to 10MB
          </span>
        </Button>
      ) : (
        <div className="relative">
          <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src={previewUrl || "/placeholder.svg"}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemoveImage}
            disabled={disabled}
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
          {selectedFile && (
            <p className="text-sm text-gray-600 mt-2 truncate">
              {selectedFile.name}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
