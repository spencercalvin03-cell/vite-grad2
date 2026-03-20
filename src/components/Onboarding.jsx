import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, SCHOOLS } from '../context/AppContext.jsx';

export default function Onboarding() {
  const { dispatch } = useApp();
  const navigate = useNavigate();

  const [step, setStep]         = useState(0);
  const [name, setName]         = useState('');
  const [bio, setBio]           = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [errors, setErrors]     = useState({});

  function validateStep0() {
    const e = {};
    if (!name.trim()) e.name = 'Your name is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep1() {
    const e = {};
    if (!selectedSchool) e.school = 'Please select your school.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleFinish() {
    const school = SCHOOLS.find(s => s.id === selectedSchool);
    dispatch({
      type: 'COMPLETE_ONBOARDING',
      payload: {
        name,
        bio,
        school: selectedSchool,
        schoolName: school?.name || '',
      },
    });
    navigate('/events');
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', background: 'var(--bg)',
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        {/* Logo */}
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
          <p style={{ color: 'var(--text2)', fontSize: 15, lineHeight: 1.6 }}>
            Schedule and discover graduation parties<br />with your whole class.
          </p>
        </div>

        {/* Step indicator */}
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

        {/* ── Step 0: name + bio ── */}
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
                  onChange={e => { setName(e.target.value); setErrors({}); }}
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

            <button
              className="btn btn-primary btn-full"
              onClick={() => { if (validateStep0()) setStep(1); }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* ── Step 1: school picker ── */}
        {step === 1 && (
          <div className="fade-in">
            <div className="card" style={{ marginBottom: 16 }}>
              <h2 className="h2" style={{ marginBottom: 6 }}>Choose your school</h2>
              <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>
                Join your class to view and post parties.
              </p>

              <div className="flex-col gap-8">
                {SCHOOLS.map(school => (
                  <div
                    key={school.id}
                    className={`school-option${selectedSchool === school.id ? ' selected' : ''}`}
                    onClick={() => { setSelectedSchool(school.id); setErrors({}); }}
                  >
                    <div className="school-icon">{school.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div className="h3">{school.name}</div>
                      <div className="caption mt-4">{school.district} · {school.count} students</div>
                    </div>
                    <div className="school-check">
                      {selectedSchool === school.id ? '✓' : ''}
                    </div>
                  </div>
                ))}
              </div>

              {errors.school && (
                <div className="form-error" style={{ marginTop: 10 }}>{errors.school}</div>
              )}
            </div>

            <div className="flex gap-10">
              <button className="btn btn-outline" onClick={() => setStep(0)}>← Back</button>
              <button
                className="btn btn-primary flex-1"
                onClick={() => { if (validateStep1()) setStep(2); }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: confirmation ── */}
        {step === 2 && (
          <div className="fade-in">
            <div className="card text-center" style={{ marginBottom: 16, padding: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
              <h2 className="h2" style={{ marginBottom: 8 }}>You're all set, {name.split(' ')[0]}!</h2>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
                You've joined <strong style={{ color: 'var(--text)' }}>
                  {SCHOOLS.find(s => s.id === selectedSchool)?.name}
                </strong> for the Class of 2025.
              </p>
              <p className="muted mt-8" style={{ fontSize: 13 }}>
                You can now view events from your school, RSVP, and create your own parties.
              </p>
            </div>

            <button className="btn btn-primary btn-full" onClick={handleFinish}>
              Let's go! →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
