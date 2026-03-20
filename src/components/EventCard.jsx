import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, formatTime, formatDate, privacyLabel, privacyBadgeClass } from '../context/AppContext.jsx';

const ACCENT_COLORS = {
  pm:   'var(--gold)',
  eve:  'var(--accent)',
  late: '#f472b6',
};

function timePeriod(timeStr) {
  if (!timeStr) return 'eve';
  const h = parseInt(timeStr.split(':')[0], 10);
  if (h < 17) return 'pm';
  if (h < 21) return 'eve';
  return 'late';
}

export default function EventCard({ event, showRsvp = true }) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const tp = timePeriod(event.time);
  const accentColor = ACCENT_COLORS[tp];
  const myRsvp = state.rsvps[event.id];
  const goingCount = Object.values(event.rsvps || {}).filter(v => v === 'going').length
    + (myRsvp === 'going' ? 1 : 0);

  function handleRsvp(e, value) {
    e.stopPropagation();
    dispatch({ type: 'SET_RSVP', payload: { eventId: event.id, value } });
  }

  return (
    <div
      className="event-card"
      style={{ cursor: 'pointer' }}
      onClick={() => navigate(`/events/${event.id}`)}
    >
      {/* Left accent bar */}
      <div className="event-card-accent" style={{ background: accentColor }} />

      <div className="flex items-start gap-12">
        {/* Emoji icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'var(--surface2)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 22, flexShrink: 0
        }}>
          {event.emoji}
        </div>

        {/* Main info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="h3" style={{ marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {event.title}
          </div>
          <div className="flex items-center gap-8 flex-wrap" style={{ fontSize: 13, color: 'var(--text2)' }}>
            <span>by {event.hostName}</span>
            <span>·</span>
            <span>📅 {formatDate(event.date)}</span>
            <span>·</span>
            <span>🕐 {formatTime(event.time)}</span>
          </div>
          <div className="flex items-center gap-8 mt-8 flex-wrap">
            <span className={`badge ${privacyBadgeClass(event.privacy)}`}>
              {privacyLabel(event.privacy)}
            </span>
            {goingCount > 0 && (
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                {goingCount} going
              </span>
            )}
          </div>
        </div>

        {/* Time badge */}
        <div style={{
          fontSize: 12, fontWeight: 700, color: 'var(--text3)',
          background: 'var(--bg2)', padding: '4px 8px',
          borderRadius: 8, whiteSpace: 'nowrap', flexShrink: 0
        }}>
          {formatTime(event.time)}
        </div>
      </div>

      {/* RSVP row */}
      {showRsvp && (
        <div className="flex items-center gap-8 mt-12" onClick={e => e.stopPropagation()}>
          {[
            { value: 'going',     label: '✓ Going',    cls: 'going'     },
            { value: 'maybe',     label: '◑ Maybe',    cls: 'maybe'     },
            { value: 'not_going', label: '✗ Can\'t go',cls: 'not-going' },
          ].map(({ value, label, cls }) => (
            <button
              key={value}
              className={`rsvp-pill${myRsvp === value ? ` ${cls}` : ''}`}
              onClick={e => handleRsvp(e, value)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
