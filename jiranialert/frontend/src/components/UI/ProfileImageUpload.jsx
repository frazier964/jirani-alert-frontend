import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Loader } from 'lucide-react'
import { updateCurrentUserProfile, getCurrentUser } from '../../lib/auth'

export default function ProfileImageUpload({ onUploadComplete, trigger = null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = (file) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
      setError(null)
    }
    reader.readAsDataURL(file)
    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!preview) return

    setIsLoading(true)
    try {
      // If Firebase Storage is available, upload the file and use the download URL
      let finalUrl = preview
      try {
        const { storage, ensureAnonymous, storageRef: sRef, uploadBytesResumable, getDownloadURL } = await import('../../lib/firebase')
        if (storage && selectedFile) {
          // ensure there's an authenticated user for storage rules
          const fbUser = await ensureAnonymous()
          const path = `profiles/${fbUser ? fbUser.uid : 'anonymous'}/avatar-${Date.now()}`
          const ref = sRef(storage, path)
          const snap = await new Promise((resolve, reject) => {
            const task = uploadBytesResumable(ref, selectedFile)
            task.on('state_changed', null, reject, () => resolve(task.snapshot))
          })
          finalUrl = await getDownloadURL(sRef(storage, path))
        }
      } catch (e) {
        // if storage not configured, fallback to data URL
      }

      await updateCurrentUserProfile({
        profileImageUrl: finalUrl,
        updatedAt: new Date().toISOString(),
      })

      if (onUploadComplete) {
        onUploadComplete(finalUrl)
      }

      // Reset and close
      setSelectedFile(null)
      setPreview(null)
      setIsOpen(false)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to upload image')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          <Upload className="h-4 w-4" />
          Upload Photo
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            >
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Upload Profile Photo</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Preview or Upload Area */}
              {preview ? (
                <div className="mb-6 space-y-4">
                  <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-64 w-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Choose Different Photo
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="mb-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-12 px-4 transition-colors hover:border-slate-400 hover:bg-slate-100"
                >
                  <Upload className="mb-3 h-8 w-8 text-slate-400" />
                  <p className="text-sm font-semibold text-slate-700">
                    Click to upload or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!preview || isLoading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading && <Loader className="h-4 w-4 animate-spin" />}
                  {isLoading ? 'Uploading...' : 'Upload Photo'}
                </button>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
