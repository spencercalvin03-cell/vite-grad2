import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.js'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [authUser, setAuthUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [rsvps, setRsvps] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setAuthLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (profile) { fetchEvents(); fetchMyRsvps() }
  }, [profile])

  async function fetchProfile(userId) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (error && error.code !== 'PGRST116') console.error('fetchProfile error:', error)
    setProfile(data ?? null)
    setAuthLoading(false)
  }

  async function fetchEvents() {
    if (!profile) return
    setLoading(true)
    const { data, error } = await supabase.from('events').select('*').eq('school_id', profile.school_id).order('date', { ascending: true })
    if (error) setError(error.message)
    else setEvents(data)
    setLoading(false)
  }

  async function fetchMyRsvps() {
    if (!authUser) return
    const { data, error } = await supabase.from('rsvps').select('event_id, status').eq('user_id', authUser.id)
    if (!error && data) {
      const map = {}
      data.forEach(r => { map[r.event_id] = r.status })
      setRsvps(map)
    }
  }

  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
    setProfile(null); setEvents([]); setRsvps({})
  }

  async function createProfile({ name, school_id, bio }) {
    const initials = name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    const { data, error } = await supabase.from('profiles').insert({ id: authUser.id, name: name.trim(), initials, school_id, bio: bio.trim() }).select().single()
    if (error) throw error
    setProfile(data)
    return data
  }

  async function updateProfile({ name, bio }) {
    const initials = name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    const { data, error } = await supabase.from('profiles').update({ name: name.trim(), initials, bio: bio.trim() }).eq('id', authUser.id).select().single()
    if (error) throw error
    setProfile(data)
  }

  async function createEvent({ title, emoji, date, time, description, location, privacy }) {
    const { data, error } = await supabase.from('events').insert({ title, emoji, date, time, description, location: location || 'TBD', privacy, school_id: profile.school_id, host_id: authUser.id, host_name: profile.name }).select().single()
    if (error) throw error
    setEvents(prev => [data, ...prev].sort((a, b) => a.date.localeCompare(b.date)))
    return data
  }

  async function setRsvp(eventId, status) {
    const current = rsvps[eventId]
    if (current === status) {
      const { error } = await supabase.from('rsvps').delete().eq('event_id', eventId).eq('user_id', authUser.id)
      if (error) throw error
      setRsvps(prev => { const next = { ...prev }; delete next[eventId]; return next })
      return
    }
    const { error } = await supabase.from('rsvps').upsert({ event_id: eventId, user_id: authUser.id, status }, { onConflict: 'event_id,user_id' })
    if (error) throw error
    setRsvps(prev => ({ ...prev, [eventId]: status }))
  }

  const value = { authUser, profile, authLoading, signUp, signIn, signOut, createProfile, updateProfile, events, loading, error, fetchEvents, createEvent, rsvps, setRsvp }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

export const AV_COLORS = [
  ['rgba(181,123,255,.35)', '#b57bff'],
  ['rgba(122,139,255,.35)', '#7a8bff'],
  ['rgba(244,114,182,.35)', '#f472b6'],
  ['rgba(52,211,153,.35)',  '#34d399'],
  ['rgba(251,191,36,.35)',  '#fbbf24'],
  ['rgba(248,113,113,.35)', '#f87171'],
  ['rgba(34,211,238,.35)',  '#22d3ee'],
]

export function avStyle(idx = 0) {
  const [bg, tc] = AV_COLORS[idx % AV_COLORS.length]
  return { background: bg, color: tc }
}

export function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

export function formatDate(d) {
  if (!d) return ''
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatDateLong(d) {
  if (!d) return ''
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export function heatColor(n) {
  if (!n) return null
  if (n <= 2) return 'var(--green)'
  if (n <= 4) return 'var(--gold)'
  return 'var(--red)'
}

export function privacyLabel(p) {
  return { pub: '🏫 School-wide', friends: '👥 Friends only', invite: '🔒 Invite only' }[p] || p
}

export function privacyBadgeClass(p) {
  return { pub: 'badge-pub', friends: 'badge-friends', invite: 'badge-invite' }[p] || 'badge-pub'
}
