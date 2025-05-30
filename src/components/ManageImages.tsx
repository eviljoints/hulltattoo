import React, { useState, useEffect, ChangeEvent } from 'react'

type FileItem = { name: string; url: string }

export default function ManageImages() {
  const [files,   setFiles]   = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [renames, setRenames] = useState<Record<string,string>>({})

  // 1) LIST
  async function fetchFiles() {
    const res = await fetch('/api/design-images')
    const list: FileItem[] = await res.json()
    setFiles(list)
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  // 2) RENAME INPUT
  function handleRenameInput(oldName: string, value: string) {
    setRenames(r => ({ ...r, [oldName]: value }))
  }

  // 3) RENAME (PATCH)
  async function renameFile(oldName: string) {
    const newName = renames[oldName]?.trim()
    if (!newName || newName === oldName) return
    setLoading(true)
    try {
      const res = await fetch('/api/design-images', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, newName }),
      })
      if (!res.ok) throw new Error((await res.json()).error || res.statusText)
      await fetchFiles()
      setRenames(r => { delete r[oldName]; return { ...r } })
    } catch (err: any) {
      console.error('Rename failed', err)
      alert('Rename failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // 4) DELETE
  async function deleteFile(name: string) {
    if (!confirm(`Delete "${name}" permanently?`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/design-images?name=${encodeURIComponent(name)}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        throw new Error((await res.json()).error || res.statusText)
      }
      await fetchFiles()
    } catch (err: any) {
      console.error('Delete failed', err)
      alert('Delete failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      maxWidth: 800,
      margin:    '2rem auto',
      padding:   '1rem',
      color:     '#fff',
      background:'#000',
    }}>
      <h2>Manage Uploaded Images</h2>
      {files.length === 0 && <p>No images found.</p>}
      {files.map(f => (
        <div key={f.name} style={{
          display:      'flex',
          alignItems:   'center',
          marginBottom: 16,
          padding:      8,
          border:       '1px solid #444',
          borderRadius: 4,
          background:   '#111',
        }}>
          <img
            src={f.url}
            alt={f.name}
            width={80}
            style={{ borderRadius:4, marginRight:16 }}
          />

          <div style={{ flex: 1 }}>
            <div><strong>Current:</strong> {f.name}</div>
            <div style={{ marginTop:4 }}>
              <input
                type="text"
                placeholder="New filename.ext"
                value={renames[f.name] ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleRenameInput(f.name, e.target.value)
                }
                disabled={loading}
                style={{
                  width:        '60%',
                  padding:      4,
                  marginRight:  8,
                  background:   '#222',
                  color:        '#fff',
                  border:       '1px solid #555',
                  borderRadius: 4,
                }}
              />
              <button
                onClick={() => renameFile(f.name)}
                disabled={loading || !renames[f.name]}
                style={{ padding: '4px 8px', cursor: 'pointer' }}
              >
                Rename
              </button>
            </div>
          </div>

          <button
            onClick={() => deleteFile(f.name)}
            disabled={loading}
            style={{
              marginLeft:   16,
              padding:      '4px 8px',
              background:   'red',
              color:        '#fff',
              border:       'none',
              borderRadius: 4,
              cursor:       'pointer',
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}
