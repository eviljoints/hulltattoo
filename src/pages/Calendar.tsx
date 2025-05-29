// pages/Calendar.tsx
import React, { useState } from 'react'
import MikesAvailability from '../components/MikesAvailability'
import PoppysAvailability from '../components/PoppysAvailability'

const CalendarPage: React.FC = () => {
  const [who, setWho] = useState<'mike' | 'poppy'>('mike')

  return (
    <div style={{ background: 'rgb(42, 0, 21)', color: '#fff', padding: '1rem' }}>
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
        <label htmlFor="availability-selector" style={{ marginRight: '0.5rem' }}>
          View availability for:
        </label>
        <select
          id="availability-selector"
          value={who}
          onChange={(e) => setWho(e.target.value as 'mike' | 'poppy')}
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
          <option value="poppy">Poppy</option>
        </select>
      </div>

      {who === 'mike' ? <MikesAvailability /> : <PoppysAvailability />}
    </div>
  )
}

export default CalendarPage
