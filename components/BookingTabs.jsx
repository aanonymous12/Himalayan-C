'use client';
import { useState } from 'react';

export default function BookingTabs({ reserve, catering }) {
  const [tab, setTab] = useState('reserve');
  return (
    <div>
      <div className="tabs" role="group" aria-label="Booking type">
        <button type="button" className="chip" aria-pressed={tab === 'reserve'} onClick={() => setTab('reserve')}>Reserve a table</button>
        <button type="button" className="chip" aria-pressed={tab === 'catering'} onClick={() => setTab('catering')}>Catering</button>
      </div>
      <div hidden={tab !== 'reserve'}>{reserve}</div>
      <div hidden={tab !== 'catering'}>{catering}</div>
    </div>
  );
}
