import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, formatDate } from '../context/AppContext.jsx';

const EMOJIS = ['🎉','🏊','🔥','🌅','🎊','🌇','🎈','🎸','🏖️','🍕','🎮','⭐'];

export default function CreateEvent() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const [title,   setTitle]   = useState('');
  const [emoji,   setEmoji]   = useState('🎉');
  const [date,    setDate]    = useState('');
  const [time,    setTime]    = useState('18:00');
  const [desc,    setDesc]    = useState('');
  const [location,setLocation]= useState('');
  const [privacy, setPrivacy] = useState('pub');
  const [errors,  setErrors]  = useState({});
  const [submitted, setSubmitted] = useState(false);

  const mySchool = state.user.school;

  // Check how many events are on the chosen date
  const conflictCount = date
    ? state.events.filter(e => e.date === date && e.school === mySchool).length
    : 0;

  function validate() {
    const e = {};
    if (!title.trim())  e.title = 'Party name is required.';
    if (!date)          e.date  = 'Date is required.';
    if (!time)          e.time  = 'Time is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    dispatch({
      type: 'CREATE_EVENT',
      payload: { title: title.trim(), emoji, date, time, desc: desc.trim(), location: location.trim() || 'TBD', privacy },
    });
    setSubmitted(true);
    setTimeout(() => navigate('/events'), 1800);
  }

  if (submitted) {
    return (
      <div className="page fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div className="text-center">
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h2 className="h2" style={{ marginBottom: 8 }}>Party created!</h2>
          <p className="muted">Taking you to the events list…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <div className="flex items-center justify-between mb-20">
        <div>
          <h1 className="h1">New Party</h1>
          <p className="muted mt-4" style={{ fontSize: 13 }}>
            Hosting at {state.user.schoolName}
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>

        {/* Emoji picker */}
        <div className="form-field">
          <label className="form-label">Pick an emoji</label>
          <div className="flex flex-wrap gap-8">
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                style={{
                  fontSize: 24, width: 44, height: 44, borderRadius: 10,
                  background: emoji === e ? 'rgba(181,123,255,0.2)' : 'var(--surface2)',
                  border: `1.5px solid ${emoji === e ? 'var(--accent)' : 'var(--border)'}`,
                  cursor: 'pointer', transition: 'all 0.18s',
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="form-field">
          <label className="form-label">Party name *</label>
          <input
            className={`form-input${errors.title ? ' error' : ''}`}
            type="text"
            placeholder="e.g. Jake's Grad Bash 2025"
            value={title}
            onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: '' })); }}
          />
          {errors.title && <div className="form-error">{errors.title}</div>}
        </div>

        {/* Date + Time */}
        <div className="form-row">
          <div className="form-field">
            <label className="form-label">Date *</label>
            <input
              className={`form-input${errors.date ? ' error' : ''}`}
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: '' })); }}
            />
            {errors.date && <div className="form-error">{errors.date}</div>}
          </div>
          <div className="form-field">
            <label className="form-label">Time *</label>
            <input
              className={`form-input${errors.time ? ' error' : ''}`}
              type="time"
              value={time}
              onChange={e => { setTime(e.target.value); setErrors(p => ({ ...p, time: '' })); }}
            />
            {errors.time && <div className="form-error">{errors.time}</div>}
          </div>
        </div>

        {/* Conflict warning */}
        {conflictCount > 0 && (
          <div className={`alert ${conflictCount >= 3 ? 'alert-warn' : 'alert-info'}`} style={{ marginBottom: 14 }}>
            <span style={{ fontSize: 16 }}>{conflictCount >= 3 ? '⚠️' : 'ℹ️'}</span>
            <span>
              <strong>{conflictCount} other {conflictCount === 1 ? 'party' : 'parties'}</strong> already
              scheduled on {formatDate(date)}.
              {conflictCount >= 3 && ' This is a busy date — you may want to pick a different day for better attendance.'}
            </span>
          </div>
        )}

        {/* Description */}
        <div className="form-field">
          <label className="form-label">Description <span style={{ color: 'var(--text3)' }}>(optional)</span></label>
          <textarea
            className="form-input"
            rows={3}
            placeholder="Tell everyone what to expect — food, music, vibe, dress code…"
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />
        </div>

        {/* Location */}
        <div className="form-field">
          <label className="form-label">Location <span style={{ color: 'var(--text3)' }}>(optional)</span></label>
          <input
            className="form-input"
            type="text"
            placeholder="Address or venue name"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
          <p className="form-hint">For invite-only events, the address is shown only to approved guests.</p>
        </div>

        {/* Privacy */}
        <div className="form-field" style={{ marginBottom: 0 }}>
          <label className="form-label">Who can see this?</label>
          <div className="privacy-opts">
            {[
              { value: 'pub',     icon: '🏫', label: 'School-wide' },
              { value: 'friends', icon: '👥', label: 'Friends only' },
              { value: 'invite',  icon: '🔒', label: 'Invite only'  },
            ].map(opt => (
              <div
                key={opt.value}
                className={`privacy-opt${privacy === opt.value ? ' selected' : ''}`}
                onClick={() => setPrivacy(opt.value)}
              >
                <div className="opt-icon">{opt.icon}</div>
                <div className="opt-label">{opt.label}</div>
              </div>
            ))}
          </div>
          <p className="form-hint mt-8">
            {privacy === 'pub'     && 'Everyone at your school can see and RSVP.'}
            {privacy === 'friends' && 'Only people you\'re friends with can see this.'}
            {privacy === 'invite'  && 'Only invited guests can see this. Location is hidden until approved.'}
          </p>
        </div>
      </div>

      <div className="flex gap-10">
        <button className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
        <button className="btn btn-primary flex-1" onClick={handleSubmit}>
          Create Party ✨
        </button>
      </div>
    </div>
  );
}
