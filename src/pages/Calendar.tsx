// pages/Calendar.tsx
import React, { useState } from 'react'
import MikesAvailability from '../components/MikesAvailability'
import HarleysAvailability from '../components/HarleyAvailability'

const CalendarPage: React.FC = () => {
  const [who, setWho] = useState<'mike' | 'Harley'>('mike')

  return (
    <div style={{ background: 'rgb(42, 0, 21)', color: '#fff', padding: '1rem' }}>
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
        <label htmlFor="availability-selector" style={{ marginRight: '0.5rem' }}>
          View availability for:
        </label>
        <select
          id="availability-selector"
          value={who}
          onChange={(e) => setWho(e.target.value as 'mike' | 'Harley')}
          style={{
            background:   '#111',
            color:        '#fff',
            border:       '1px solid #444',
            padding:      '0.5rem 1rem',
            borderRadius: '4px',
            cursor:       'pointer',
          }}
        >
          <option value="mike">Mike</option>
          <option value="harley">Harley</option>
        </select>
      </div>

      {who === 'mike' ? <MikesAvailability /> : <HarleysAvailability />}
    </div>
  )
}

export default CalendarPage
