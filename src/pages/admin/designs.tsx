// src/pages/admin/designs.tsx

import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
} from 'react'
import FileUploader from '../../components/FileUploader'
import ManageImages from '~/components/ManageImages'

const ARTISTS = ['Mike', 'Poppy', 'Harley'] as const
type Artist = typeof ARTISTS[number]

type Design = {
  id:         number
  name:       string
  price:      string
  artistName: Artist
  imagePath:  string
  pageNumber: number
  description:string
}

type FileItem = {
  name: string
  url:  string
}

type AdminForm = {
  title:       string
  price:       string
  artistName:  Artist
  imagePath:   string
  prompt:      string
  description: string
}

const AdminDesignsPage: React.FC = () => {
  const [files,   setFiles]   = useState<FileItem[]>([])
  const [designs, setDesigns] = useState<Design[]>([])
  const [form, setForm]       = useState<AdminForm>({
    title:      '',
    price:      '',
    artistName: 'Mike',
    imagePath:  '',
    prompt:     '',
    description:'',
  })
  const [message,    setMessage]    = useState<string>('')
  const [generating, setGenerating] = useState<boolean>(false)

  useEffect(() => {
    refreshFiles()
    fetchDesigns()
  }, [])

  /** load blob URLs */
  function refreshFiles() {
    fetch('/api/design-images')
      .then(r => r.json())
      .then((data: FileItem[]) => setFiles(data))
      .catch(console.error)
  }

  /** load existing designs */
  async function fetchDesigns() {
    try {
      const res = await fetch('/api/admin/designs')
      if (!res.ok) throw new Error(await res.text())
      setDesigns(await res.json())
    } catch (err) {
      console.error(err)
    }
  }

  function handleChange(
    e: ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  /** only regenerates the description */
  async function handleGenerate() {
    if (!form.title || !form.prompt) return
    setGenerating(true)
    try {
      const res  = await fetch('/api/admin/generate-description', {
        method: 'POST',
        headers:{ 'Content-Type':'application/json' },
        body:   JSON.stringify({
          rawName:  form.title,
          prompt:   form.prompt,
          imageUrl: form.imagePath,
        }),
      })
      const json = await res.json()
      if (res.ok && 'description' in json) {
        setForm(f => ({ ...f, description: json.description }))
      } else {
        console.error(json.error)
      }
    } catch(err) {
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setMessage('')
    try {
      const res = await fetch('/api/admin/designs', {
        method: 'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          name:        form.title,
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
        title:      '',
        price:      '',
        artistName: 'Mike',
        imagePath:  '',
        prompt:     '',
        description:'',
      })
      fetchDesigns()
    } catch(err:any) {
      setMessage('Error: ' + err.message)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Really delete this design?')) return
    try {
      const res = await fetch(`/api/admin/designs?id=${id}`, { method:'DELETE' })
      if (!res.ok) throw new Error(await res.text())
      fetchDesigns()
    } catch(err) {
      console.error(err)
    }
  }

  return (
    <div className="container">
      <div className="uploader">
        <FileUploader onUpload={url => {
          refreshFiles()
          setForm(f => ({ ...f, imagePath: url }))
        }} />
      </div>

      <h1>Admin: Add / Manage Tattoo Designs</h1>

      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          Tattoo Title
          <input 
            name="title" 
            value={form.title} 
            onChange={handleChange} 
            required 
          />
        </label>
        <label>
          Price (£)
          <input 
            type="number" 
            name="price" 
            min="0" 
            step="1" 
            value={form.price} 
            onChange={handleChange} 
            required 
          />
        </label>
        <label>
          Artist
          <select 
            name="artistName" 
            value={form.artistName} 
            onChange={handleChange} 
            required
          >
            {ARTISTS.map(a=>(
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>
        <label>
          Choose Image
          <select 
            name="imagePath" 
            value={form.imagePath} 
            onChange={handleChange} 
            required
          >
            <option value="">– select file –</option>
            {files.map(f=>(
              <option key={f.url} value={f.url}>{f.name}</option>
            ))}
          </select>
        </label>
        {form.imagePath && (
          <img className="preview" src={form.imagePath} alt="Preview" />
        )}
        <label>
          Short Prompt (for auto-gen)
          <input 
            name="prompt" 
            value={form.prompt} 
            onChange={handleChange} 
            placeholder="e.g. ‘Tribal line-work, minimal’" 
          />
        </label>
        <button 
          type="button"
          className="center-btn" 
          onClick={handleGenerate} 
          disabled={!form.title||!form.prompt||generating}
        >
          {generating?'Generating…':'Generate Description'}
        </button>
        <label>
          Final Description
          <textarea
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
          />
        </label>
        <button type="submit">Save Design</button>
      </form>

      {message && <p className={message.startsWith('Error')?'error':'success'}>{message}</p>}

      <ManageImages />

      <h2>Existing Designs</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {['Pg','Title','Artist','Price','Img','Desc',''].map((h,i)=>(
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {designs.map(d=>(
              <tr key={d.id}>
                <td>{d.pageNumber}</td>
                <td>{d.name}</td>
                <td>{d.artistName}</td>
                <td>£{d.price}</td>
                <td>
                  <img src={d.imagePath} alt={d.name} width={50} />
                </td>
                <td>{d.description}</td>
                <td>
                  <button onClick={()=>handleDelete(d.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .container {
          max-width: 600px;
          margin: 2rem auto;
          padding: 1rem;
        }
        .uploader { text-align:center; margin-bottom:1.5rem }
        h1 { text-align:center }
        .admin-form {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        /* two-column on at least 600px */
        @media (min-width: 600px) {
          .admin-form { grid-template-columns: repeat(2, 1fr) }
          /* make description textarea span both columns */
          .admin-form textarea {
            grid-column: span 2;
          }
          .admin-form button[type="button"] {
            grid-column: span 2;
          }
        }
        .preview {
          max-width: 100%;
          border:1px solid #444;
          border-radius:4px;
          grid-column: span 2;
        }
        button {
          padding: 0.5rem;
          cursor: pointer;
        }
        .table-wrapper {
          overflow-x: auto;
          margin-top:1rem;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 0.5rem;
          border-bottom: 1px solid #444;
          text-align: left;
        }
        .error { color: red; }
        .success { color: green; }
      `}</style>
    </div>
  )
}

export default AdminDesignsPage
