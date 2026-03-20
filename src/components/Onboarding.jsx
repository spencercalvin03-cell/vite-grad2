import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

export default function Onboarding() {
  const { createProfile, signOut } = useApp()

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [school, setSchool] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  function validateStep0() {
    const e = {}
    if (!name.trim()) e.name = 'Your name is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep1() {
    const e = {}
    if (!school.trim()) e.school = 'Please enter your school name.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleFinish() {
    setLoading(true)
    try {
      await createProfile({ name, school_id: school.trim().toLowerCase().replace(/\s+/g, '_'), bio })
    } catch (err) {
      setErrors({ submit: err.message })
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', background: 'var(--bg)',
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>🎓</div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800,
            background: 'linear-gradient(135deg, var(--accent), #7a8bff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', marginBottom: 6,
          }}>
            GradParty
          </div>
        </div>

        <div className="flex items-center justify-between mb-16" style={{ gap: 6 }}>
          {['Your info', 'Your school', 'All set!'].map((label, i) => (
            <div key={i} className="flex-1" style={{ textAlign: 'center' }}>
              <div style={{
                height: 3, borderRadius: 2,
                background: i <= step ? 'var(--accent)' : 'var(--surface2)',
                marginBottom: 5, transition: 'background 0.3s',
              }} />
              <span style={{ fontSize: 11, color: i <= step ? 'var(--accent)' : 'var(--text3)', fontWeight: 600 }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="fade-in">
            <div className="card" style={{ marginBottom: 16 }}>
              <h2 className="h2" style={{ marginBottom: 6 }}>Create your profile</h2>
              <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>
                Tell your classmates who you are.
              </p>
              <div className="form-field">
                <label className="form-label">Your name</label>
                <input
                  className={`form-input${errors.name ? ' error' : ''}`}
                  type="text"
                  placeholder="e.g. Jordan Smith"
                  value={name}
                  onChange={e => { setName(e.target.value); setErrors({}) }}
                  autoFocus
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>
              <div className="form-field" style={{ marginBottom: 0 }}>
                <label className="form-label">Bio <span style={{ color: 'var(--text3)' }}>(optional)</span></label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder='e.g. "soccer captain ⚽ · class of 2025"'
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                />
              </div>
            </div>
            <button className="btn btn-primary btn-full" onClick={() => { if (validateStep0()) setStep(1) }}>
              Continue →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="fade-in">
            <div className="card" style={{ marginBottom: 16 }}>
              <h2 className="h2" style={{ marginBottom: 6 }}>Your school</h2>
              <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>
                Type your full high school name. This is how other students from your school will find you.
              </p>
              <div className="form-field" style={{ marginBottom: 0 }}>
                <label className="form-label">School name</label>
                <input
                  className={`form-input${errors.school ? ' error' : ''}`}
                  type="text"
                  placeholder="e.g. Lincoln High School, Chicago IL"
                  value={school}
                  onChange={e => { setSchool(e.target.value); setErrors({}) }}
                  autoFocus
                />
                <p className="form-hint">Include your city so students at the right school find you.</p>
                {errors.school && <div className="form-error">{errors.school}</div>}
              </div>
            </div>
            <div className="flex gap-10">
              <button className="btn btn-outline" onClick={() => setStep(0)}>← Back</button>
              <button className="btn btn-primary flex-1" onClick={() => { if (validateStep1()) setStep(2) }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in">
            <div className="card text-center" style={{ marginBottom: 16, padding: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
              <h2 className="h2" style={{ marginBottom: 8 }}>You're all set, {name.split(' ')[0]}!</h2>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
                You've joined <strong style={{ color: 'var(--text)' }}>{school}</strong>.
              </p>
              <p className="muted mt-8" style={{ fontSize: 13 }}>
                You can now view events, RSVP, and create your own parties.
              </p>
            </div>
            {errors.submit && (
              <div className="alert alert-warn" style={{ marginBottom: 14 }}>
                <span>⚠️</span><span>{errors.submit}</span>
              </div>
            )}
            <button className="btn btn-primary btn-full" onClick={handleFinish} disabled={loading}>
              {loading ? 'Setting up…' : "Let's go! →"}
            </button>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text3)' }}>
          Wrong account?{' '}
          <button className="btn-ghost" style={{ color: 'var(--text3)', textDecoration: 'underline', padding: 0 }} onClick={signOut}>
            Sign out
          </button>
        </p>

      </div>
    </div>
  )
}
