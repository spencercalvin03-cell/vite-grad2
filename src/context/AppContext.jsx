import React, { createContext, useContext, useReducer, useEffect } from 'react';

// ── Seed data ────────────────────────────────────────────────────────────────

export const SCHOOLS = [
  { id: 'wv', name: 'Westview High',      district: 'Riverside USD', emoji: '🏫', count: 847 },
  { id: 'ml', name: 'Maple Leaf Academy', district: 'Riverside USD', emoji: '🍁', count: 612 },
  { id: 'rh', name: 'Ridgemont High',     district: 'Valley USD',    emoji: '⛰️',  count: 934 },
  { id: 'sh', name: 'Sunrise High',       district: 'Valley USD',    emoji: '🌅', count: 720 },
];

const SEED_EVENTS = [
  {
    id: 'e1', title: "Jake's Grad Pool Party", hostName: 'Mia K.',
    emoji: '🏊', date: '2025-06-07', time: '15:00',
    desc: 'Biggest pool party of the season! Bring your swimsuit and good vibes.',
    location: '123 Riverside Dr', privacy: 'pub', school: 'wv',
    rsvps: {},
  },
  {
    id: 'e2', title: "Class of '25 BBQ Bash", hostName: 'Tyler L.',
    emoji: '🔥', date: '2025-06-07', time: '17:30',
    desc: "Senior BBQ! Firing up the grill one last time. Burgers, hot dogs, good memories.",
    location: 'Westview Park Pavilion', privacy: 'pub', school: 'wv',
    rsvps: {},
  },
  {
    id: 'e3', title: 'Rooftop Sunset Vibes', hostName: 'Sofia R.',
    emoji: '🌅', date: '2025-06-07', time: '19:00',
    desc: 'Intimate rooftop hangout watching the sunset. Close friends only.',
    location: 'Revealed to approved guests', privacy: 'invite', school: 'wv',
    rsvps: {},
  },
  {
    id: 'e4', title: 'Backyard Grad Fiesta', hostName: 'Alex P.',
    emoji: '🎊', date: '2025-06-14', time: '14:00',
    desc: 'Themed fiesta! Decorations, music, piñata, and way too much food.',
    location: 'Revealed to approved guests', privacy: 'pub', school: 'wv',
    rsvps: {},
  },
  {
    id: 'e5', title: 'Westview Sunset Rooftop', hostName: 'Jordan W.',
    emoji: '🌇', date: '2025-06-21', time: '18:30',
    desc: "School-wide rooftop sendoff. Let's watch the sunset one last time as a class.",
    location: 'Westview Arts Building Rooftop', privacy: 'pub', school: 'wv',
    rsvps: {},
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'gradparty_v1';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

function buildInitialState() {
  const saved = loadFromStorage();
  if (saved?.onboarded) return saved;
  return {
    onboarded: false,
    user: { id: 'u1', name: '', initials: '', school: '', schoolName: '', bio: '', colorIdx: 0 },
    events: SEED_EVENTS,
    rsvps: {},   // { [eventId]: 'going' | 'maybe' | 'not_going' }
  };
}

// ── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {

    case 'COMPLETE_ONBOARDING': {
      const { name, school, schoolName, bio } = action.payload;
      const initials = name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      return {
        ...state,
        onboarded: true,
        user: { ...state.user, name: name.trim(), initials, school, schoolName, bio: bio.trim() },
      };
    }

    case 'UPDATE_PROFILE': {
      const { name, bio } = action.payload;
      const initials = name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      return { ...state, user: { ...state.user, name: name.trim(), initials, bio: bio.trim() } };
    }

    case 'CREATE_EVENT': {
      const newEvent = {
        ...action.payload,
        id: 'e' + Date.now(),
        hostName: state.user.name,
        hostId: state.user.id,
        school: state.user.school,
        rsvps: {},
      };
      return { ...state, events: [newEvent, ...state.events] };
    }

    case 'SET_RSVP': {
      const { eventId, value } = action.payload;
      const current = state.rsvps[eventId];
      // Toggle off if same value clicked again
      if (current === value) {
        const { [eventId]: _, ...rest } = state.rsvps;
        return { ...state, rsvps: rest };
      }
      return { ...state, rsvps: { ...state.rsvps, [eventId]: value } };
    }

    case 'RESET':
      return buildInitialState();

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, buildInitialState);

  // Persist to localStorage on every state change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

// ── Utility helpers exported for components ───────────────────────────────────

export const AV_COLORS = [
  ['rgba(181,123,255,.35)', '#b57bff'],
  ['rgba(122,139,255,.35)', '#7a8bff'],
  ['rgba(244,114,182,.35)', '#f472b6'],
  ['rgba(52,211,153,.35)',  '#34d399'],
  ['rgba(251,191,36,.35)',  '#fbbf24'],
  ['rgba(248,113,113,.35)', '#f87171'],
  ['rgba(34,211,238,.35)',  '#22d3ee'],
];

export function avStyle(idx = 0) {
  const [bg, tc] = AV_COLORS[idx % AV_COLORS.length];
  return { background: bg, color: tc };
}

export function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export function formatDate(d) {
  if (!d) return '';
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateLong(d) {
  if (!d) return '';
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function heatColor(n) {
  if (!n) return null;
  if (n <= 2) return 'var(--green)';
  if (n <= 4) return 'var(--gold)';
  return 'var(--red)';
}

export function privacyLabel(p) {
  return { pub: '🏫 School-wide', friends: '👥 Friends only', invite: '🔒 Invite only' }[p] || p;
}

export function privacyBadgeClass(p) {
  return { pub: 'badge-pub', friends: 'badge-friends', invite: 'badge-invite' }[p] || 'badge-pub';
}
