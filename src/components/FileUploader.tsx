// components/FileUploader.tsx
import React, { useState } from 'react'

type Props = { onUpload?: (filename: string) => void }

const FileUploader: React.FC<Props> = ({ onUpload }) => {
  const [file, setFile] = useState<File | null>(null)
  const [filename, setFilename] = useState<string>('')
  const [status, setStatus] = useState<'idle'|'uploading'|'error'|'done'>('idle')
  const [error, setError] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null
    setError('')
    setStatus('idle')
    setFile(selected)
    if (selected) {
      // Pre-fill input with the file's base name (no extension)
      const base = selected.name.replace(/\.[^/.]+$/, '')
      setFilename(base)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilename(e.target.value)
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file.')
      return
    }

    setStatus('uploading')
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    // append user-supplied name if present
    if (filename.trim()) {
      formData.append('filename', filename.trim())
    }

    try {
      const res = await fetch('/api/admin/upload-design', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Upload failed')
      setStatus('done')
      onUpload?.(json.filename)
    } catch (err: any) {
      console.error(err)
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <div>
      <label style={{ marginTop: 8, display: 'block' }}>
        Select Image:
        <input
          type="file"
          name="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'block', marginTop: 4 }}
        />
      </label>
      <button
        onClick={handleUpload}
        disabled={!file || status === 'uploading'}
        style={{
          marginTop: 12,
          padding: '0.5rem 1rem',
          background: '#00d4ff',
          border: 'none',
          cursor: file ? 'pointer' : 'not-allowed',
        }}
      >
        {status === 'uploading' ? 'Uploading…' : 'Upload'}
      </button>
      {status === 'done' && <p style={{ color: 'green' }}>Uploaded!</p>}
      {status === 'error' && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
export default FileUploader