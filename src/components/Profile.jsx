import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, avStyle, SCHOOLS } from '../context/AppContext.jsx';
import EventCard from './EventCard';

export default function Profile() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(state.user.name);
  const [bio,  setBio]  = useState(state.user.bio || '');
  const [error, setError] = useState('');

  const myEvents   = state.events.filter(e => e.hostId === state.user.id);
  const goingEvents = state.events.filter(e => state.rsvps[e.id] === 'going');
  const school = SCHOOLS.find(s => s.id === state.user.school);

  function handleSave() {
    if (!name.trim()) { setError('Name is required.'); return; }
    dispatch({ type: 'UPDATE_PROFILE', payload: { name, bio } });
    setEditing(false);
    setError('');
  }

  function handleReset() {
    if (window.confirm('Reset all data and start over from onboarding?')) {
      dispatch({ type: 'RESET' });
      navigate('/');
    }
  }

  return (
    <div className="page fade-in">
      <h1 className="h1" style={{ marginBottom: 20 }}>Profile</h1>

      {/* Profile card */}
      <div className="card" style={{ marginBottom: 16 }}>
        {!editing ? (
          <>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-14">
                <div
                  className="avatar avatar-lg"
                  style={avStyle(state.user.colorIdx)}
                >
                  {state.user.initials || 'ME'}
                </div>
                <div>
                  <h2 className="h2">{state.user.name}</h2>
                  <div className="caption mt-4">
                    {school ? `${school.emoji} ${school.name}` : 'No school selected'} · Class of 2025
                  </div>
                  {state.user.bio && (
                    <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6, lineHeight: 1.6 }}>
                      {state.user.bio}
                    </p>
                  )}
                </div>
              </div>
              <button className="btn btn-outline btn-sm shrink-0" onClick={() => { setEditing(true); setName(state.user.name); setBio(state.user.bio || ''); }}>
                Edit
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-20 mt-16" style={{ paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              {[
                { label: 'Hosting',  value: myEvents.length    },
                { label: 'Going to', value: goingEvents.length },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>{value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, marginTop: 2, fontFamily: 'var(--font-display)' }}>{label}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div>
            <h3 className="h3" style={{ marginBottom: 16 }}>Edit Profile</h3>
            <div className="form-field">
              <label className="form-label">Name</label>
              <input className="form-input" type="text" value={name} onChange={e => { setName(e.target.value); setError(''); }} />
              {error && <div className="form-error">{error}</div>}
            </div>
            <div className="form-field" style={{ marginBottom: 16 }}>
              <label className="form-label">Bio</label>
              <textarea className="form-input" rows={2} value={bio} onChange={e => setBio(e.target.value)} />
            </div>
            <div className="flex gap-10">
              <button className="btn btn-outline" onClick={() => { setEditing(false); setError(''); }}>Cancel</button>
              <button className="btn btn-primary flex-1" onClick={handleSave}>Save changes</button>
            </div>
          </div>
        )}
      </div>

      {/* My events */}
      {myEvents.length > 0 && (
        <>
          <div className="section-header">
            <h3 className="h3">My parties</h3>
          </div>
          <div className="flex-col gap-10" style={{ marginBottom: 20 }}>
            {myEvents.map(ev => <EventCard key={ev.id} event={ev} showRsvp={false} />)}
          </div>
        </>
      )}

      {/* Going to */}
      {goingEvents.length > 0 && (
        <>
          <div className="section-header">
            <h3 className="h3">Going to</h3>
          </div>
          <div className="flex-col gap-10" style={{ marginBottom: 20 }}>
            {goingEvents.map(ev => <EventCard key={ev.id} event={ev} showRsvp={false} />)}
          </div>
        </>
      )}

      {myEvents.length === 0 && goingEvents.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🎈</div>
          <h3 className="h3">Nothing here yet</h3>
          <p>Create a party or RSVP to events to see them here.</p>
          <button className="btn btn-primary mt-16" onClick={() => navigate('/create')}>
            Create a party →
          </button>
        </div>
      )}

      {/* Danger zone */}
      <div className="section-header mt-24">
        <h3 className="h3" style={{ color: 'var(--text3)' }}>Settings</h3>
      </div>
      <div className="card card-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="h4">Reset app data</div>
            <div className="caption mt-4">Clear all data and return to onboarding</div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={handleReset}>Reset</button>
        </div>
      </div>
    </div>
  );
}
