import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, formatDate } from '../context/AppContext.jsx';
import EventCard from './EventCard';

const FILTERS = [
  { id: 'all',    label: 'All events'   },
  { id: 'going',  label: 'Going'        },
  { id: 'upcoming',label: 'Upcoming'   },
];

export default function EventsList() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [search, setSearch]  = useState('');

  const mySchool = state.user.school;

  const filtered = useMemo(() => {
    let evs = state.events.filter(e => e.school === mySchool);

    if (filter === 'going') {
      evs = evs.filter(e => state.rsvps[e.id] === 'going');
    } else if (filter === 'upcoming') {
      const today = new Date().toISOString().split('T')[0];
      evs = evs.filter(e => e.date >= today);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      evs = evs.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.hostName.toLowerCase().includes(q) ||
        e.desc?.toLowerCase().includes(q)
      );
    }

    // Sort by date ascending
    return [...evs].sort((a, b) => a.date.localeCompare(b.date));
  }, [state.events, state.rsvps, mySchool, filter, search]);

  // Group by date
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(ev => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="page fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-16">
        <div>
          <h1 className="h1">Events</h1>
          <p className="muted mt-4" style={{ fontSize: 13 }}>
            {state.user.schoolName} · Class of 2025
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/create')}>
          + New Party
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <span style={{
          position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
          fontSize: 16, pointerEvents: 'none', opacity: 0.5,
        }}>🔍</span>
        <input
          className="form-input"
          style={{ paddingLeft: 38 }}
          type="text"
          placeholder="Search events…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filter chips */}
      <div className="chips" style={{ marginBottom: 20, paddingLeft: 0 }}>
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`chip${filter === f.id ? ' on' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Events grouped by date */}
      {grouped.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎈</div>
          <h3 className="h3">No events found</h3>
          <p>
            {filter === 'going'
              ? "You haven't RSVPed to any events yet."
              : "Be the first to host a party!"}
          </p>
          <button
            className="btn btn-primary mt-16"
            onClick={() => navigate('/create')}
          >
            Create a party →
          </button>
        </div>
      ) : (
        grouped.map(([date, events]) => (
          <div key={date}>
            <div className="section-header">
              <h3 className="h3">{formatDate(date)}</h3>
            </div>
            <div className="flex-col gap-10">
              {events.map(ev => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
