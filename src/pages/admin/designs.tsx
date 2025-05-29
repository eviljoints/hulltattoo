// pages/admin/designs.tsx
import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
} from 'react'
import FileUploader from '../../components/FileUploader'

const ARTISTS = ['Mike', 'Poppy', 'Harley'] as const
type Artist = typeof ARTISTS[number]

type Design = {
  id:         number
  name:       string
  price:      string        // we store as whole‐number strings
  artistName: Artist
  imagePath:  string
  pageNumber: number
  description:string
}

type AdminForm = {
  name:        string
  price:       string
  artistName:  Artist
  imagePath:   string
  prompt:      string
  description: string
}

const AdminDesignsPage: React.FC = () => {
  const [files, setFiles]           = useState<string[]>([])
  const [designs, setDesigns]       = useState<Design[]>([])
  const [form, setForm]             = useState<AdminForm>({
    name:        '',
    price:       '',
    artistName:  'Mike',
    imagePath:   '',
    prompt:      '',
    description: '',
  })
  const [message, setMessage]       = useState<string>('')
  const [generating, setGenerating] = useState(false)

  // helper to load filenames
  const refreshFiles = () => {
    fetch('/api/design-images')
      .then(r => r.json())
      .then(setFiles)
      .catch(console.error)
  }

  useEffect(() => {
    refreshFiles()
    fetchDesigns()
  }, [])

  async function fetchDesigns() {
    try {
      const res = await fetch('/api/admin/designs')
      if (!res.ok) throw new Error(await res.text())
      setDesigns(await res.json())
    } catch (err) {
      console.error('Failed to load designs', err)
    }
  }

  function handleChange(
    e: ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleGenerate() {
    if (!form.name || !form.prompt) return
    setGenerating(true)
    try {
      const res = await fetch('/api/admin/generate-description', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          rawName: form.name,
          prompt:  form.prompt,
        }),
      })
      const json = await res.json()
      if (res.ok && 'generatedName' in json) {
        setForm(f => ({
          ...f,
          name:        json.generatedName,
          description: json.description,
        }))
      } else {
        console.error(json.error || 'Generation failed')
      }
    } catch (err) {
      console.error('Generation error', err)
    } finally {
      setGenerating(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setMessage('')
    try {
      const res = await fetch('/api/admin/designs', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:        form.name,
          price:       form.price,
          artistName:  form.artistName,
          imagePath:   form.imagePath,
          description: form.description,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || res.statusText)
      }
      setMessage('Design saved!')
      setForm({
        name:        '',
        price:       '',
        artistName:  'Mike',
        imagePath:   '',
        prompt:      '',
        description: '',
      })
      fetchDesigns()
    } catch (err: any) {
      setMessage('Error: ' + err.message)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Really delete this design? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/admin/designs?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || res.statusText)
      }
      fetchDesigns()
    } catch (err) {
      console.error('Delete failed', err)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>
      {/* --- File uploader centered at top --- */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <FileUploader
          onUpload={(filename) => {
            refreshFiles()
            setForm(f => ({ ...f, imagePath: filename }))
          }}
        />
      </div>

      <h1 style={{ textAlign: 'center' }}>Admin: Add / Manage Tattoo Designs</h1>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <label>
          Tattoo Name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
          />
        </label>

        <label>
          Price (£ whole number)
          <input
            type="number"
            name="price"
            step="1"
            min="0"
            value={form.price}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
          />
        </label>

        <label>
          Artist
          <select
            name="artistName"
            value={form.artistName}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
          >
            {ARTISTS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>

        <label>
          Choose Image
          <select
            name="imagePath"
            value={form.imagePath}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
          >
            <option value="">-- select file --</option>
            {files.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </label>
        {form.imagePath && (
          <img
            src={`/designs/${form.imagePath}`}
            alt="Preview"
            style={{ maxWidth: '100%', border: '1px solid #444', borderRadius: 4 }}
          />
        )}

        <label>
          Short Prompt (for auto-gen)
          <input
            name="prompt"
            value={form.prompt}
            onChange={handleChange}
            placeholder="e.g. ‘Tribal line-work, minimal’"
            style={{ width: '100%' }}
          />
        </label>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!form.name || !form.prompt || generating}
          style={{
            background: generating ? '#888' : '#00d4ff',
            color:      '#000',
            border:     'none',
            padding:    '0.5rem',
            cursor:     generating ? 'wait' : 'pointer',
          }}
        >
          {generating ? 'Generating…' : 'Auto-generate Name & Description'}
        </button>

        <label>
          Final Description
          <textarea
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            style={{ width: '100%' }}
          />
        </label>

        <button type="submit" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
          Save Design
        </button>
      </form>

      {message && (
        <p style={{ marginTop: '1rem', color: message.startsWith('Error') ? 'red' : 'green' }}>
          {message}
        </p>
      )}

      <h2 style={{ marginTop: '2rem' }}>Existing Designs</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Pg','Name','Artist','Price','Img','Desc',''].map((h,i) => (
              <th
                key={i}
                style={{ padding:'0.5rem', borderBottom:'1px solid #444', textAlign:'left' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {designs.map(d => (
            <tr key={d.id}>
              <td style={{ padding:'0.5rem' }}>{d.pageNumber}</td>
              <td style={{ padding:'0.5rem' }}>{d.name}</td>
              <td style={{ padding:'0.5rem' }}>{d.artistName}</td>
              <td style={{ padding:'0.5rem' }}>£{d.price}</td>
              <td style={{ padding:'0.5rem' }}>
                <img
                  src={`/designs/${d.imagePath}`}
                  alt={d.name}
                  width={50}
                  style={{ borderRadius:4 }}
                />
              </td>
              <td style={{ padding:'0.5rem' }}>{d.description}</td>
              <td style={{ padding:'0.5rem' }}>
                <button
                  onClick={() => handleDelete(d.id)}
                  style={{ background:'transparent', color:'red', border:'none', cursor:'pointer' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminDesignsPage
