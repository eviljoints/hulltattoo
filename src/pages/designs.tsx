// src/pages/designs.tsx

import React, { useState, useEffect } from 'react'
import type { NextPage } from 'next'

type Design = {
  id:         number
  name:       string            // tattoo title
  price:      number | string
  artistName: string
  imagePath:  string            // full Blob URL
  pageNumber: number
  description?: string
}

const ARTISTS = ['Mike','Poppy','Harley'] as const
type Artist = typeof ARTISTS[number]

const DesignsPage: NextPage = () => {
  const [artist, setArtist]   = useState<Artist>('Mike')
  const [designs, setDesigns] = useState<Design[]>([])

  useEffect(() => {
    fetch(`/api/designs?artistName=${artist}`)
      .then(r => r.json())
      .then((data: Design[]) => setDesigns(data))
      .catch(console.error)
  }, [artist])

  return (
    <div className="root">
      <h1>Hull Tattoo Studio Designs</h1>

      <div className="selector">
        <label htmlFor="artist-select">Choose artist:</label>
        <select
          id="artist-select"
          value={artist}
          onChange={(e) => setArtist(e.target.value as Artist)}
        >
          {ARTISTS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="gallery">
        {designs.map(d => (
          <div className="card" key={d.id}>
            <div className="img-wrap">
              <img src={d.imagePath} alt={d.name} />
            </div>
            <div className="info">
              <h2>{d.name}</h2> {/* Tattoo Title */}
              <p className="artist">By {d.artistName}</p>
              <p className="price">
                £{typeof d.price === 'number'
                   ? Math.floor(d.price)
                   : parseInt(d.price as string,10)}
              </p>
              {d.description && <p className="desc">{d.description}</p>}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .root {
          background: #000;
          color: #fff;
          min-height: 100vh;
          padding: 2rem 1rem;
        }
        h1 {
          text-align: center;
          color: #ff007f;
          text-shadow: 0 0 10px #ff007f;
          margin-bottom: 1.5rem;
        }
        .selector {
          text-align: center;
          margin-bottom: 2rem;
        }
        select {
          padding: 0.5rem 1rem;
          font-size: 1rem;
          border-radius: 4px;
          border: 1px solid #444;
          background: #111;
          color: #fff;
        }
        .gallery {
          display: flex;
          overflow-x: auto;
          gap: 1rem;
          padding-bottom: 1rem;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }
        .gallery::-webkit-scrollbar {
          height: 6px;
        }
        .gallery::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 3px;
        }
        .card {
          flex: 0 0 80%;
          max-width: 80%;
          background: #fdfaf5;
          border-radius: 8px;
          box-shadow:
            0 0 10px #ff007f,
            0 0 20px #00d4ff inset;
          scroll-snap-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          box-sizing: border-box;
          color: #000;
          transition: transform 0.2s ease;
        }
        .card:hover {
          transform: translateY(-5px);
        }
        .img-wrap {
          width: 100%;
          padding-top: 60%;
          position: relative;
          margin-bottom: 1rem;
        }
        .img-wrap img {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          width: 100%; height: 100%;
          object-fit: contain;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        .info {
          text-align: center;
          padding: 0.5rem;
        }
        .info h2 {
          margin: 0 0 0.5rem;
          font-size: 1.25rem;
          color: #ff007f;
          text-transform: uppercase;
          text-shadow: 0 0 5px #ff007f;
        }
        .artist {
          margin: 0.25rem 0;
          font-style: italic;
          color: #444;
        }
        .price {
          margin: 0.5rem 0;
          font-weight: bold;
          font-size: 1rem;
          color: #333;
        }
        .desc {
          margin-top: 0.75rem;
          font-size: 0.9rem;
          line-height: 1.4;
          color: #222;
          background: rgba(255,255,255,0.8);
          padding: 0.5rem;
          border-radius: 4px;
        }
        @media (min-width: 768px) {
          .gallery {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px,1fr));
            overflow: visible;
          }
          .card {
            max-width: none;
            scroll-snap-align: none;
          }
        }
      `}</style>
    </div>
  )
}

export default DesignsPage
