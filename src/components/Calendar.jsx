import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, formatDateLong, formatTime, heatColor, privacyLabel, privacyBadgeClass } from '../context/AppContext.jsx';

const DAY_HEADERS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function Calendar() {
  const { state } = useApp();
  const navigate = useNavigate();

  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState(null);

  const mySchool = state.user.school;

  // Map date string → event list for this school
  const eventsByDate = useMemo(() => {
    const map = {};
    state.events
      .filter(e => e.school === mySchool)
      .forEach(e => {
        if (!map[e.date]) map[e.date] = [];
        map[e.date].push(e);
      });
    return map;
  }, [state.events, mySchool]);

  // Build calendar cells
  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result = [];

    // Empty leading cells
    for (let i = 0; i < firstDay; i++) result.push(null);

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      result.push(`${year}-${mm}-${dd}`);
    }
    return result;
  }, [year, month]);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  }

  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const todayStr = today.toISOString().split('T')[0];
  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : [];

  return (
    <div className="page fade-in">
      <div className="flex items-center justify-between mb-20">
        <h1 className="h1">Calendar</h1>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/create')}>
          + New Party
        </button>
      </div>

      {/* Calendar */}
      <div className="card" style={{ marginBottom: 20 }}>
        {/* Month nav */}
        <div className="cal-month-nav">
          <button className="btn-icon" onClick={prevMonth} style={{ fontSize: 18, color: 'var(--text2)' }}>‹</button>
          <span className="h3">{monthLabel}</span>
          <button className="btn-icon" onClick={nextMonth} style={{ fontSize: 18, color: 'var(--text2)' }}>›</button>
        </div>

        {/* Day headers */}
        <div className="cal-day-headers">
          {DAY_HEADERS.map(d => (
            <div key={d} className="cal-day-hdr">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="cal-grid">
          {cells.map((dateStr, i) => {
            if (!dateStr) return <div key={`empty-${i}`} className="cal-cell empty" />;

            const count  = (eventsByDate[dateStr] || []).length;
            const isToday = dateStr === todayStr;
            const isSel   = dateStr === selectedDate;
            const hc = heatColor(count);

            let cls = 'cal-cell';
            if (isToday) cls += ' today';
            if (isSel)   cls += ' selected';

            return (
              <div key={dateStr} className={cls} onClick={() => setSelectedDate(isSel ? null : dateStr)}>
                <span className="day-num">{parseInt(dateStr.split('-')[2], 10)}</span>
                {hc && !isSel && (
                  <div className="heat-bar" style={{ background: hc }} />
                )}
                {count > 0 && !isSel && (
                  <span style={{ fontSize: 9, fontWeight: 700, color: hc || 'var(--text3)', fontFamily: 'var(--font-display)' }}>
                    {count}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-16 mt-16" style={{ paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)' }}>
          {[['var(--green)', 'Open'], ['var(--gold)', 'Some parties'], ['var(--red)', 'Busy']].map(([c, l]) => (
            <span key={l} className="flex items-center gap-4">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block' }} />
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* Selected date panel */}
      {selectedDate && (
        <div className="fade-in">
          <div className="section-header">
            <h3 className="h3">{formatDateLong(selectedDate)}</h3>
          </div>

          {selectedEvents.length === 0 ? (
            <div className="card text-center" style={{ padding: 32 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🎈</div>
              <p className="muted" style={{ fontSize: 14 }}>No parties yet on this date.</p>
              <button
                className="btn btn-primary btn-sm mt-12"
                onClick={() => navigate('/create')}
              >
                Host one here →
              </button>
            </div>
          ) : (
            <div className="flex-col gap-10">
              {/* Warn if crowded */}
              {selectedEvents.length >= 3 && (
                <div className="alert alert-warn">
                  <span>⚠️</span>
                  <span>
                    <strong>{selectedEvents.length} parties</strong> on this date — it's going to be busy!
                    Consider a different date for your own party.
                  </span>
                </div>
              )}

              {selectedEvents.map(ev => {
                const myRsvp = state.rsvps[ev.id];
                return (
                  <div
                    key={ev.id}
                    className="card card-sm"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/events/${ev.id}`)}
                  >
                    <div className="flex items-start gap-10">
                      <span style={{ fontSize: 24, flexShrink: 0 }}>{ev.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="h3" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
                        <div className="flex items-center gap-8 mt-4 flex-wrap">
                          <span className="caption">by {ev.hostName}</span>
                          <span className="caption">🕐 {formatTime(ev.time)}</span>
                          <span className={`badge ${privacyBadgeClass(ev.privacy)}`}>{privacyLabel(ev.privacy)}</span>
                        </div>
                      </div>
                      {myRsvp && (
                        <span className={`rsvp-pill ${myRsvp === 'going' ? 'going' : myRsvp === 'maybe' ? 'maybe' : 'not-going'}`}
                          style={{ fontSize: 11, padding: '4px 10px', flexShrink: 0 }}>
                          {myRsvp === 'going' ? '✓ Going' : myRsvp === 'maybe' ? '◑ Maybe' : '✗ No'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, padding: '24px 0' }}>
          Tap any date to see parties scheduled for that day
        </div>
      )}
    </div>
  );
}
