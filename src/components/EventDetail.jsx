import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp, formatTime, formatDate, privacyLabel, privacyBadgeClass, avStyle } from '../context/AppContext.jsx';

export default function EventDetail() {
  const { id } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const event = state.events.find(e => e.id === id);
  const myRsvp = state.rsvps[id];
  const isOwner = event?.hostId === state.user.id;

  if (!event) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">❓</div>
          <h3 className="h3">Event not found</h3>
          <button className="btn btn-outline mt-16" onClick={() => navigate('/events')}>
            ← Back to events
          </button>
        </div>
      </div>
    );
  }

  const goingCount = Object.values(event.rsvps || {}).filter(v => v === 'going').length
    + (myRsvp === 'going' ? 1 : 0);
  const maybeCount = Object.values(event.rsvps || {}).filter(v => v === 'maybe').length
    + (myRsvp === 'maybe' ? 1 : 0);

  function handleRsvp(value) {
    dispatch({ type: 'SET_RSVP', payload: { eventId: id, value } });
  }

  const privacyInfo = {
    pub:     { icon: '🏫', text: 'Visible to everyone at your school.' },
    friends: { icon: '👥', text: 'Visible to your friends only.'      },
    invite:  { icon: '🔒', text: 'Invite only. Location hidden until approved.' },
  };

  return (
    <div className="page fade-in">
      {/* Back button */}
      <button
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 20, paddingLeft: 0 }}
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      {/* Hero card */}
      <div className="card" style={{
        padding: 0, overflow: 'hidden', marginBottom: 16,
        background: 'linear-gradient(160deg, var(--surface) 60%, var(--surface2))',
      }}>
        {/* Emoji banner */}
        <div style={{
          padding: '32px 28px 20px',
          position: 'relative',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', paddingRight: 28,
            fontSize: 72, opacity: 0.12, pointerEvents: 'none',
            userSelect: 'none',
          }}>
            {event.emoji}
          </div>

          <div style={{ fontSize: 36, marginBottom: 12 }}>{event.emoji}</div>
          <h1 className="h1" style={{ marginBottom: 10, lineHeight: 1.2 }}>{event.title}</h1>

          <div className="flex items-center gap-12 flex-wrap" style={{ fontSize: 14, color: 'var(--text2)' }}>
            <span>📅 {formatDate(event.date)}</span>
            <span>🕐 {formatTime(event.time)}</span>
            <span className={`badge ${privacyBadgeClass(event.privacy)}`}>
              {privacyLabel(event.privacy)}
            </span>
          </div>
        </div>

        {/* Meta grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          borderBottom: '1px solid var(--border)',
        }}>
          {[
            { label: 'Going',  value: goingCount,  color: 'var(--green)' },
            { label: 'Maybe',  value: maybeCount,  color: 'var(--gold)'  },
            { label: 'Host',   value: event.hostName, color: 'var(--text)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ padding: '14px 18px', borderRight: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 4, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
              <div style={{ fontSize: typeof value === 'number' ? 22 : 14, fontWeight: 700, color, fontFamily: 'var(--font-display)' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* RSVP */}
        {!isOwner && (
          <div style={{ padding: '16px 20px' }}>
            <div className="form-label" style={{ marginBottom: 10 }}>Your RSVP</div>
            <div className="flex gap-8 flex-wrap">
              {[
                { value: 'going',     label: '✓ Going',     cls: 'going'     },
                { value: 'maybe',     label: '◑ Maybe',     cls: 'maybe'     },
                { value: 'not_going', label: "✗ Can't go",  cls: 'not-going' },
              ].map(({ value, label, cls }) => (
                <button
                  key={value}
                  className={`rsvp-pill${myRsvp === value ? ` ${cls}` : ''}`}
                  onClick={() => handleRsvp(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            {myRsvp && (
              <p className="form-hint mt-8">
                {myRsvp === 'going' && '🎉 You\'re going! See you there.'}
                {myRsvp === 'maybe' && '⏳ You\'re marked as maybe.'}
                {myRsvp === 'not_going' && '😢 You won\'t be attending.'}
                {' '}Click your current status to undo.
              </p>
            )}
          </div>
        )}

        {isOwner && (
          <div style={{ padding: '14px 20px' }}>
            <div className="alert alert-info">
              <span>🎯</span>
              <span>This is your event. Share it with your classmates!</span>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {event.desc && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="form-label" style={{ marginBottom: 8 }}>About this party</div>
          <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>{event.desc}</p>
        </div>
      )}

      {/* Location */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="form-label" style={{ marginBottom: 8 }}>📍 Location</div>
        {event.privacy === 'invite' && !isOwner ? (
          <div className="alert alert-info">
            <span>🔒</span>
            <span>Location is hidden until the host approves your RSVP. Mark yourself as going to request access.</span>
          </div>
        ) : (
          <p style={{ fontSize: 14, color: 'var(--text2)' }}>{event.location || 'TBD'}</p>
        )}
      </div>

      {/* Privacy info */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="form-label" style={{ marginBottom: 8 }}>🔐 Privacy</div>
        <div className="flex items-start gap-10">
          <span style={{ fontSize: 20 }}>{privacyInfo[event.privacy]?.icon}</span>
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
            {privacyInfo[event.privacy]?.text}
          </p>
        </div>
      </div>

      {/* Host info */}
      <div className="card">
        <div className="form-label" style={{ marginBottom: 12 }}>🎉 Hosted by</div>
        <div className="flex items-center gap-12">
          <div
            className="avatar avatar-md avatar-sq"
            style={avStyle(0)}
          >
            {event.hostName?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'}
          </div>
          <div>
            <div className="h3">{event.hostName}</div>
            <div className="caption mt-4">Class of 2025</div>
          </div>
        </div>
      </div>
    </div>
  );
}
