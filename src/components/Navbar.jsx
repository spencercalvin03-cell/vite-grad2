import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp, avStyle } from '../context/AppContext.jsx';

export default function Navbar() {
  const { state } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const links = [
    { path: '/events',  label: 'Events'     },
    { path: '/calendar',label: 'Calendar'   },
    { path: '/create',  label: '+ New Party'},
  ];

  return (
    <nav className="navbar">
      <button className="navbar-logo" onClick={() => navigate('/events')}>
        GRADPARTY
      </button>

      <div className="navbar-links">
        {links.map(l => (
          <button
            key={l.path}
            className={`nav-link${pathname === l.path ? ' active' : ''}`}
            onClick={() => navigate(l.path)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div
        className="nav-user"
        style={avStyle(state.user.colorIdx)}
        onClick={() => navigate('/profile')}
        title="Your profile"
      >
        {state.user.initials || 'ME'}
      </div>
    </nav>
  );
}
