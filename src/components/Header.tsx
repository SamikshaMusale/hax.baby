import './Header.css'

interface HeaderProps {
  theme: 'day' | 'night'
  onToggleTheme: () => void
}

export const Header = ({ theme, onToggleTheme }: HeaderProps) => {
  return (
    <header className="site-header" role="banner">
      <div className="content-wrap header-inner">
        <a href="/" className="header-brand" aria-label="Pip's Midnight Dream Lab Home">
          <span className="brand-icon" aria-hidden="true">★</span>
          <div className="brand-text">
            <span className="brand-name">Pip's Midnight Dream Lab</span>
            <span className="brand-sub">Midnight Nursery · haX.baby</span>
          </div>
        </a>

        <div className="header-controls">
          {/* Day / Night Mood Toggle */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'day' ? 'night' : 'day'} mode`}
            aria-pressed={theme === 'night'}
          >
            <span className="theme-toggle-icon" aria-hidden="true">
              {theme === 'day' ? '☀️' : '🌙'}
            </span>
            <span className="theme-toggle-label">
              {theme === 'day' ? 'Day Mood' : 'Night Mood'}
            </span>
          </button>

          <div className="header-status-badge" role="status" aria-label="Current nursery status">
            <span className="status-sparkle" aria-hidden="true">{theme === 'day' ? '☁️' : '🌙'}</span>
            <span className="status-text">
              Shift: <strong>{theme === 'day' ? 'Daydreaming' : 'Midnight Dreams'}</strong>
            </span>
            <span className="status-indicator" title="Active shift" aria-hidden="true"></span>
          </div>
        </div>
      </div>
    </header>
  )
}
